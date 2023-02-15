import { Component } from 'preact';
import * as secp from '@noble/secp256k1';
import Profile from './profile';
import Meta from './meta';

class NosrtEmbed extends Component {
  constructor(props) {
    super(props);
    this.state = {
      noteId: props.noteId,
      relay: props.relay || 'wss://relay.nostr.band',
      note: {},
      profile: {},
      profilePkey: '',
      likesCount: 0,
      repostsCount: 0,
      repliesCount: 0,
    };
  }

  sha256(string) {
    const utf8 = new TextEncoder().encode(string);
    return secp.utils.sha256(utf8).then((hashBuffer) => {
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray
        .map((bytes) => bytes.toString(16).padStart(2, '0'))
        .join('');
      return hashHex;
    });
  }

  async getNostrEventID(m) {
    const a = [0, m.pubkey, m.created_at, m.kind, m.tags, m.content];
    const s = JSON.stringify(a);
    const h = await this.sha256(s);
    return h;
  }

  verifyNostrSignature(event) {
    return secp.schnorr.verify(event.sig, event.id, event.pubkey);
  }

  async validateNostrEvent(event) {
    if (event.id !== (await this.getNostrEventID(event))) return false;
    if (typeof event.content !== 'string') return false;
    if (typeof event.created_at !== 'number') return false;

    if (!Array.isArray(event.tags)) return false;
    for (let i = 0; i < event.tags.length; i++) {
      let tag = event.tags[i];
      if (!Array.isArray(tag)) return false;
      for (let j = 0; j < tag.length; j++) {
        if (typeof tag[j] === 'object') return false;
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
    const socket = new WebSocket(this.state.relay);

    socket.onopen = () => {
      this.fetchNote({ socket });
      console.log(`Connected to Nostr relay: ${socket.url}`);
    };

    socket.onerror = () => {
      console.log(`Failed to connect to Nostr relay: ${socket.url}`);
    };

    const subs = {};
    socket.onmessage = (e) => {
      try {
        const d = JSON.parse(e.data);
        if (!d || !d.length) throw 'Bad reply from relay';

        if (d[0] == 'NOTICE' && d.length == 2) {
          console.log('notice from', socket.url, d[1]);
          return;
        }

        if (d[0] == 'EOSE' && d.length > 1) {
          if (d[1] in subs) subs[d[1]].on_event(null);
          return;
        }

        if (d[0] != 'EVENT' || d.length < 3) throw 'Unknown reply from relay';

        if (d[1] in subs) subs[d[1]].on_event(d[2]);
      } catch (error) {
        console.log('relay', socket.url, 'bad message', e, 'error', error);
        err(error);
      }
    };

    socket.listEvents = ({ sub, ok, err }) => {
      let id = 'embed-' + Math.random();
      const req = ['REQ', id, sub];
      socket.send(JSON.stringify(req));

      const close = () => {
        const sub_id = id;
        id = null;
        socket.send(JSON.stringify(['CLOSE', sub_id]));
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
            err('timeout on relay', socket.url);
          }
        },
        sub.limit && sub.limit == 1 ? 2000 : 4000
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

      subs[id] = { ok, err, on_event };
    };
  }

  getEvent({ socket, sub, ok, err }) {
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

  listEvents({ socket, sub }) {
    return new Promise((ok, err) => {
      socket.listEvents({ sub, ok, err });
    });
  }

  fetchNote({ socket }) {
    const sub = { ids: [this.state.noteId], kinds: [1] };
    this.getEvent({ socket, sub })
      .then((event) => {
        if (event) {
          this.setState({
            note: event,
            profilePkey: event.pubkey,
          });
          this.fetchProfile({ socket, profilePkey: event.pubkey });
          this.fetchMeta({ socket, noteId: this.state.noteId });
        } else {
          console.log("Error: We can't find that note on this relay");
          this.setState({
            note: {
              error: true,
              content:
                "Sorry, we weren't able to find this note on the specified relay.",
            },
          });
        }
      })
      .catch((error) => {
        console.log(`Error fetching note: ${error}`);
        this.setState({
          note: {
            error: true,
            content:
              "Sorry, there was an error fetching this note from the specified relay. Most often, this is because the relay isn't responding.",
          },
        });
      });
  }

  fetchProfile({ socket, profilePkey }) {
    const sub = { kinds: [0], authors: [profilePkey] };
    this.getEvent({ socket, sub })
      .then((event) => {
        if (event) {
          let parsedProfile = JSON.parse(event.content);
          this.setState({ profile: parsedProfile });
        }
      })
      .catch((error) => {
        console.log(`Error fetching profile: ${error}`);
      });
  }

  fetchMeta({ socket, noteId }) {
    const sub = { kinds: [1, 6, 7], '#e': [noteId] };
    this.listEvents({ socket, sub }).then((events) => {
      for (let noteEvent of events) {
        switch (noteEvent['kind']) {
          case 6:
            this.setState((state) => ({
              repostsCount: state.repostsCount + 1,
            }));
            break;
          case 7:
            this.setState((state) => ({
              likesCount: state.likesCount + 1,
            }));
            break;
          case 1:
            this.setState((state) => ({
              repliesCount: state.repliesCount + 1,
            }));
            break;
          default:
            console.log('Unknown note kind');
        }
      }
    });
  }

  render() {
    return (
      <div class="nostrEmbedCard">
        <Profile
          profilePkey={this.state.profilePkey}
          profile={this.state.profile}
        />
        <div
          class={
            this.state.note.error
              ? 'cardContent ne-text-red-800'
              : 'cardContent'
          }
        >
          {this.state.note.content}
        </div>
        <Meta
          note={this.state.note}
          likesCount={this.state.likesCount}
          repliesCount={this.state.repliesCount}
          repostsCount={this.state.repostsCount}
        />
      </div>
    );
  }
}

export default NosrtEmbed;
