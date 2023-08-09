import * as secp from "@noble/secp256k1";
import {decode} from "light-bolt11-decoder";
import {Component} from "preact";
import {parseNaddr, parseNoteId, parseNpub,} from "../utils/common";
import ProfilesList from "./components/ProfilesList.jsx";
import Profile from "./components/Profile.jsx";
import {KIND_CONTACT_LIST, KIND_LONG_NOTE, KIND_META, KIND_NOTE, KIND_PROFILE_LIST, KIND_REACTION, KIND_REPOST, KIND_ZAP} from "../config/config";
import Zap from "./components/Zap.jsx";
import Note from "./components/Note.jsx";
import LongNote from "./components/LongNote.jsx";

class NostrEmbed extends Component {
  constructor(props) {
    super(props);

    let id = props.id; // hex event id by default
    let kind = KIND_NOTE; // default for fetchEvent
    if (props.id.startsWith("npub1")) {
      id = parseNpub(props.id);
      kind = KIND_META; // fetchProfile
    } else if (props.id.startsWith("note1")) {
      id = parseNoteId(props.id);
    } else if (props.id.startsWith("naddr")) {
      id = parseNaddr(props.id);
      kind = KIND_CONTACT_LIST; // default for fetchNaddr
    }

    this.state = {
      id,
      kind,
      relay: props.relay,
      event: {}, // raw source event
      profile: {}, // author of the current event
      profilesList: {}, // 3, 30000 etc
      taggedProfiles: {},
      follows: [],
      zap: {},
      profilePkey: "",
      likesCount: 0,
      repostsCount: 0,
      repliesCount: 0,
      zapAmount: 0,
      followersCount: 0,
      countTaggedProfiles: 0,
    };
  }

  sha256(string) {
    const utf8 = new TextEncoder().encode(string);
    return secp.utils.sha256(utf8).then((hashBuffer) => {
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray
        .map((bytes) => bytes.toString(16).padStart(2, "0"))
        .join("");
    });
  }

  async getNostrEventID(m) {
    const a = [0, m.pubkey, m.created_at, m.kind, m.tags, m.content];
    const s = JSON.stringify(a);
    return await this.sha256(s);
  }

  verifyNostrSignature(event) {
    return secp.schnorr.verify(event.sig, event.id, event.pubkey);
  }

  async validateNostrEvent(event) {
    if (event.id !== (await this.getNostrEventID(event))) return false;
    if (typeof event.content !== "string") return false;
    if (typeof event.created_at !== "number") return false;

    if (!Array.isArray(event.tags)) return false;
    for (let i = 0; i < event.tags.length; i++) {
      let tag = event.tags[i];
      if (!Array.isArray(tag)) return false;
      for (let j = 0; j < tag.length; j++) {
        if (typeof tag[j] === "object") return false;
      }
    }

    return true;
  }

  async isValidEvent(ev) {
    return (
      ev.id &&
      ev.pubkey &&
      ev.sig &&
      (await this.validateNostrEvent(ev)) &&
      this.verifyNostrSignature(ev)
    );
  }

  componentDidMount() {
    const start = (socket) => {
      switch (this.state.kind) {
        case KIND_META:
          return this.fetchProfile({socket, profilePkey: this.state.id});
        case KIND_NOTE:
          return this.fetchEvent({socket, noteId: this.state.id});
        case KIND_CONTACT_LIST:
          return this.fetchNaddr({socket, data: this.state.id.data});
      }
    };

    if (!window.__nostrEmbed) window.__nostrEmbed = {sockets: {}};

    let socket = null;
    if (this.state.relay in window.__nostrEmbed.sockets) {
      socket = window.__nostrEmbed.sockets[this.state.relay];
      if (socket.readyState == 1)
        // open
        start(socket);
      else if (socket.readyState == 0)
        // connecting
        socket.starts.push(start);
      else socket = null;
    }

    if (socket) return;

    socket = new WebSocket(this.state.relay);
    window.__nostrEmbed.sockets[this.state.relay] = socket;

    socket.starts = [start];

    socket.onopen = () => {
      console.log(`Connected to Nostr relay: ${ socket.url }`);
      for (const s of socket.starts) s(socket);
      socket.starts = null;
    };

    socket.onerror = (ev) => {
      console.log(`Failed to connect to Nostr relay: ${ socket.url }}`);
    };

    const subs = {};
    socket.onmessage = (e) => {
      try {
        const d = JSON.parse(e.data);
        if (!d || !d.length) throw "Bad reply from relay";

        if (d[0] == "NOTICE" && d.length == 2) {
          console.log("notice from", socket.url, d[1]);
          return;
        }

        if (d[0] == "EOSE" && d.length > 1) {
          if (d[1] in subs) subs[d[1]].on_event(null);
          return;
        }

        if (d[0] == "COUNT" && d.length == 3) {
          if (d[1] in subs) subs[d[1]].on_count(d[2]);
          return;
        }

        if (d[0] != "EVENT" || d.length < 3) throw "Unknown reply from relay";

        if (d[1] in subs) subs[d[1]].on_event(d[2]);
      } catch (error) {
        console.log("relay", socket.url, "bad message", e, "error", error);
        err(error);
      }
    };

    socket.subscribe = ({type, sub, ok, err}) => {
      let id = "embed-" + Math.random();
      const req = [type, id, sub];
      socket.send(JSON.stringify(req));

      const close = () => {
        const sub_id = id;
        id = null;
        socket.send(JSON.stringify(["CLOSE", sub_id]));
        delete subs[sub_id];
      };

      const events = [];
      const queue = [];

      const done = () => {
        if (!id) return;
        clearTimeout(to);
        close();
        ok(events);
      };

      const to = setTimeout(
        function () {
          // tell relay we're no longer interested
          close();

          // maybe relay w/o EOSE support?
          if (events.length || queue.length) {
            on_event(null);
          } else {
            err("timeout on relay", socket.url);
          }
        },
        sub.limit && sub.limit == 1 ? 2000 : 6000
      );

      const on_event = async (e) => {
        queue.push(e);
        if (queue.length > 1) return;
        while (queue.length) {
          e = queue[0];
          if (e && (await this.isValidEvent(e))) events.push(e);
          queue.shift(); // dequeue after we've awaited
          if (!e || (sub.limit && sub.limit == events.length)) {
            queue.splice(0, queue.length);
            done();
            break;
          }
        }
      };

      const on_count = async (e) => {
        if (type != "COUNT") return; // misbehaving relay
        events.push(e);
        done();
      };

      subs[id] = {ok, err, on_event, on_count};
    };

    socket.listEvents = ({sub, ok, err}) => {
      socket.subscribe({type: "REQ", sub, ok, err});
    };

    socket.countEvents = ({sub, ok, err}) => {
      socket.subscribe({
        type: "COUNT",
        sub,
        ok: (events) => {
          ok(events.length ? events[0] : null);
        },
        err,
      });
    };
  }

  getEvent({socket, sub, ok, err}) {
    return new Promise((ok, err) => {
      sub.limit = 1;
      socket.listEvents({
        sub,
        ok: (events) => {
          ok(events ? events[0] : null);
        },
        err,
      });
    });
  }

  listEvents({socket, sub}) {
    return new Promise((ok, err) => {
      socket.listEvents({sub, ok, err});
    });
  }

  countEvents({socket, sub}) {
    return new Promise((ok, err) => {
      socket.countEvents({sub, ok, err});
    });
  }

  fetchEvent({socket, noteId}) {
    const sub = {ids: [noteId]};
    this.getEvent({socket, sub})
      .then((event) => {
        if (event) {
          this.setState({
            event,
            kind: event.kind,
            profilePkey: event.pubkey,
          });
          this.fetchProfile({socket, profilePkey: event.pubkey});
          if (event.kind == KIND_NOTE) {
            this.fetchMeta({socket, noteId});
            this.fetchTags({socket, tags: event.tags});
          } else if (event.kind == KIND_ZAP) {
            this.fetchZapDetails({socket, event});
          }
        } else {
          console.log("Error: We can't find that note on this relay");
          throw "Event not found";
        }
      })
      .catch((error) => {
        console.log(`Error fetching note: ${ error }`);
        this.setState({
          event: {
            id: noteId,
            error: true,
            content:
              "Sorry, we weren't able to find and parse this note on the specified relay.",
          },
        });
      });
  }

fetchZapDetails({socket, event}) {
    const description = JSON.parse(event.tags.find((el) => el.includes('description'))[1]);
    const {content} = event;

    const getSenderPubKey = () => {
      if (description.pubkey === '71bfa9cbf84110de617e959021b08c69524fcaa1033ffd062abd0ae2657ba24c' &&
      content.startsWith('From: nostr:npub1')) {
          const npub = content.split(':')[2];
          const key = parseNpub(npub)
          return key
      }

      return description.pubkey
    }
    
    const senderPubkey = getSenderPubKey();
    const payerPubkey = senderPubkey !== description.pubkey ? description.pubkey : null;
    const providerPubkey =  event.pubkey;
    const recipientPubkey = event?.tags && event.tags.find((tag) => tag[0] === "p")[1];
    const sub = {kinds: [KIND_META], authors: [senderPubkey, recipientPubkey, providerPubkey]};

    if(payerPubkey) {
      sub.authors.push(payerPubkey)
    }

    const zapAmount = this.getZapAmount(event);
    const targetEvent = event.tags.find((el) => el[0] === 'e');
   this.listEvents({socket, sub}).then((events) => {
      if (events) {
        const getProfile = (profilePubkey) => {
          return events.find((event) => event.pubkey === profilePubkey)
        }
        this.setState({
          zap: {
            ...this.state.zap,
            senderProfile: getProfile(senderPubkey),
            recipientProfile: getProfile(recipientPubkey),
            providerProfile: getProfile(providerPubkey),
            payerProfile: getProfile(payerPubkey),
            amount: zapAmount,
            content: event.content,
          }
        })
      }
    })

      if(targetEvent) {
        const targetEventId = event.tags.find((el) => el[0] === 'e')[1];
        const sub = {kinds: [KIND_NOTE], ids: [targetEventId]};
        this.listEvents({socket, sub}).then((events) => {
          if (events) {
            this.setState({
              zap: {
                ...this.state.zap,
                targetEvent: events[0]
              }
            })
          }
        })
      }
  }

  fetchProfile({socket, profilePkey}) {
    const sub = {kinds: [KIND_META], authors: [profilePkey]};
    this.getEvent({socket, sub})
      .then((event) => {
        if (event) {
          let parsedProfile = JSON.parse(event.content);
          parsedProfile.pubkey = profilePkey;
          this.setState({profilePkey, profile: parsedProfile});
          if (this.state.kind == KIND_META) {
            this.fetchProfileMeta({socket, pubkey: profilePkey});
            if (this.props.options?.showFollowing) this.fetchFollows({socket, pubkey: profilePkey})
          }
        } else {
          throw "Event not found";
        }
      })
      .catch((error) => {
        console.log(`Error fetching profile: ${ error }`);
        this.setState({
          profile: {
            pubkey: profilePkey,
            error: true,
            about:
              "Sorry, we weren't able to find this profile on the specified relay.",
          },
        });
      });
  }

  fetchFollows({socket, pubkey}) {
    const sub = {
      kinds: [KIND_CONTACT_LIST],
      authors: [pubkey]
    }
    let followedPubkeys = []
    this.getEvent({socket, sub})
      .then(event => {
        if (event) {
          event?.tags.forEach(tag => {
            if (tag[0] === "p") {
              followedPubkeys.push(tag[1])
            }
          })
          this.fetchFollowProfiles({socket, pubkeys: followedPubkeys})
        } else {
          throw "Event not found";
        }
      }).catch(error => {
      console.error(`Error fetching follows: ${ error }`);
    })
  }

  fetchFollowProfiles({socket, pubkeys}) {
    const sub = {
      kinds: [KIND_META],
      authors: pubkeys
    }
    this.listEvents({socket, sub}).then(events => {
      if (events) this.setState({follows: events})
    }).catch(error => {
      console.error(`Error fetching follow profiles: ${ error }`);
    })
  }

  fetchNaddr({socket, data}) {
    const sub = {
      kinds: [data.kind],
      "#d": [data.identifier],
      authors: [data.pubkey],
    };
    this.getEvent({socket, sub})
      .then((event) => {
        if (event) {
          this.setState({event, kind: event.kind});
          this.fetchProfile({socket, profilePkey: event.pubkey});
          if (event.kind == KIND_CONTACT_LIST || event.kind == KIND_PROFILE_LIST) {
            const profilesListObj = this.getProfilesListObj(event.tags);
            profilesListObj.created_at = event.created_at;
            profilesListObj.id = `${ data.kind }:${ data.pubkey }:${ data.identifier }`;
            profilesListObj.naddr = this.props.id;
            this.setState({profilesList: profilesListObj});
            this.fetchTags({socket, tags: event.tags});
            this.fetchMeta({socket, data});
          } 
          if (event.kind == KIND_LONG_NOTE) { 
            const profileObj = {};
            profileObj.created_at = event.tags.find((tag) => tag[0] === 'published_at')[1];
            profileObj.id = `${ data.kind }:${ data.pubkey }:${ data.identifier }`;
            profileObj.naddr = this.props.id;
            this.setState({profileObj: profileObj});
            this.fetchTags({socket, tags: event.tags})
            this.fetchMeta({socket, data})
          }
        } else {
          throw "Event not found";
        }
      })
      .catch((error) => {
        console.log(`Error fetching event by naddr: ${ error }`);
        this.setState({
          profilesList: {
            error: true,
            content:
              "Sorry, we weren't able to find this event on the specified relay.",
          },
        });
      });
  }

  fetchTags({socket, tags}) {
    const sub = {kinds: [KIND_META], authors: []};
    let count = 0;
console.log(tags);
    for (const t of tags) {
      if (sub.authors.length < 100) {
        if (t.length >= 2 && t[0] == "p") {
          sub.authors.push(t[1]);
        }
      }

      if (t.length >= 2 && t[0] == "p") {
        count++;
      }
    }

    this.setState((state) => ({
      countTaggedProfiles: state.countTaggedProfiles + count,
    }));

    if (!sub.authors.length) return;

    this.listEvents({socket, sub})
      .then((events) => {
        const taggedProfiles = {};
        for (const event of events) {
          try {
            let p = JSON.parse(event.content);
            taggedProfiles[event.pubkey] = p;
          } catch (e) {
            console.log("Error bad event content", e, event.content);
          }
        }
        this.setState({taggedProfiles});
      })
      .catch((error) => {
        console.log(`Error fetching tagged profiles: ${ error }`);
      });
  }

  getProfilesListObj(tags) {
    let profilesList = {};

    tags.forEach((tag) => {
      if (tag && tag[0]) {
        if (tag[0] === "name") {
          profilesList.name = tag[1];
        }
        if (tag[0] === "d") {
          profilesList.d = tag[1];
        }
        if (tag[0] === "description") {
          profilesList.description = tag[1];
        }
      }
    });
    return profilesList;
  }

  getZapAmount(e) {
    try {
      for (const t of e.tags) {
        if (t.length >= 2 && t[0] == "bolt11") {
          const b = decode(t[1]);
          for (const s of b.sections) {
            if (s.name == "amount") return parseInt(s.value);
          }
          break;
        }
      }
    } catch (er) {
      console.log("Error bad zap", er, e);
    }
    return 0;
  }

  onListMetaEvents(events) {
    for (let noteEvent of events) {
      switch (noteEvent["kind"]) {
        case KIND_REPOST:
          this.setState((state) => ({
            repostsCount: state.repostsCount + 1,
          }));
          break;
        case KIND_REACTION:
          this.setState((state) => ({
            likesCount: state.likesCount + 1,
          }));
          break;
        case KIND_NOTE:
          this.setState((state) => ({
            repliesCount: state.repliesCount + 1,
          }));
          break;
        case KIND_ZAP:
          this.setState((state) => ({
            zapAmount: state.zapAmount + this.getZapAmount(noteEvent),
          }));
          break;
        default:
          console.log("Unknown note kind");
      }
    }
  }

  fetchMeta({socket, noteId, data}) {
    if (socket.url.includes("wss://relay.nostr.band"))
      return this.fetchMetaCount({socket, noteId, data});
    else return this.fetchMetaList({socket, noteId, data});
  }

  fetchMetaCount({socket, noteId, data}) {
    const getSub = (kind) => {
      if (noteId) {
        return {kinds: [kind], "#e": [noteId]};
      }

      if (data) {
        return {
          kinds: [kind],
          "#a": [`${ data.kind }:${ data.pubkey }:${ data.identifier }`],
        };
      }
    };

    this.countEvents({socket, sub: getSub(KIND_NOTE)}).then((c) => {
      this.setState((state) => ({
        repliesCount: c ? c.count : 0,
      }));
    });
    this.countEvents({socket, sub: getSub(KIND_REPOST)}).then((c) => {
      this.setState((state) => ({
        repostsCount: c ? c.count : 0,
      }));
    });
    this.countEvents({socket, sub: getSub(KIND_REACTION)}).then((c) => {
      this.setState((state) => ({
        likesCount: c ? c.count : 0,
      }));
    });
    this.listEvents({socket, sub: getSub(KIND_ZAP)}).then((events) => {
      this.onListMetaEvents(events);
    });
  }

  fetchMetaList({socket, noteId, data}) {
    const sub = this.getSubOnFetchMetaList({noteId, data});

    this.listEvents({socket, sub}).then((events) => {
      this.onListMetaEvents(events);
    });
  }

  getSubOnFetchMetaList({noteId, data}) {
    if (noteId) {
      return {kinds: [KIND_NOTE, KIND_REPOST, KIND_REACTION, KIND_ZAP], "#e": [noteId]};
    }
    if (data) {
      return {
        kinds: [KIND_NOTE, KIND_REPOST, KIND_REACTION, KIND_ZAP],
        "#a": [`${ data.kind }:${ data.pubkey }:${ data.identifier }`],
      };
    }
  }

  onListProfileMetaEvents(events) {
    for (let e of events) {
      switch (e["kind"]) {
        case KIND_CONTACT_LIST:
          this.setState((state) => ({
            followersCount: state.followersCount + 1,
          }));
          break;
        case KIND_ZAP:
          this.setState((state) => ({
            zapAmount: state.zapAmount + this.getZapAmount(e),
          }));
          break;
        default:
          console.log("Unknown event kind");
      }
    }
  }

  fetchProfileMetaCount({socket, pubkey}) {
    const getSub = (kind) => {
      return {kinds: [kind], "#p": [pubkey]};
    };
    this.countEvents({socket, sub: getSub(KIND_CONTACT_LIST)}).then((c) => {
      this.setState((state) => ({
        followersCount: c ? c.count : 0,
      }));
    });
    this.listEvents({socket, sub: getSub(KIND_ZAP)}).then((events) => {
      this.onListProfileMetaEvents(events);
    });
  }

  fetchProfileMetaList({socket, pubkey}) {
    const sub = {kinds: [KIND_CONTACT_LIST, KIND_ZAP], "#p": [pubkey]};
    this.listEvents({socket, sub}).then((events) => {
      this.onListProfileMetaEvents(events);
    });
  }

  fetchProfileMeta({socket, pubkey}) {
    if (socket.url.includes("wss://relay.nostr.band"))
      return this.fetchProfileMetaCount({socket, pubkey});
    else return this.fetchProfileMetaList({socket, pubkey});
  }


  render() {
    switch (this.state.kind) {
      case KIND_META:
        return <Profile props={ this.props }
                        state={ this.state }/>
      case KIND_CONTACT_LIST:
      case KIND_PROFILE_LIST:
        return <ProfilesList props={ this.props }
                             state={ this.state }/>
      case KIND_ZAP:
        return <Zap state={ this.state }/>
      case KIND_LONG_NOTE:
        return <LongNote props={ this.props }
                         state={ this.state }/>
      default:
        return <Note props={ this.props }
                     state={ this.state }/>
    }
  }
}

export default NostrEmbed;
