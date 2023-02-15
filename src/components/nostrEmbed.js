import { Component } from 'preact';
import { isValidEvent } from '../common';
import Profile from './profile';
import Meta from './meta';
// eslint-disable-next-line no-unused-vars
import style from './style.css';

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

  componentDidMount() {
    const socket = new WebSocket(this.state.relay);

    socket.onopen = () => {
      this.fetchNote({ socket });
    };

    socket.onerror = () => {
      console.log(`Failed to connect to Nostr relay: ${socket.url}`);
    };

    const subs = {};
    socket.onmessage = (e) => {
      try {
        const d = JSON.parse(e.data);
        if (!d || !d.length) throw Error('Bad reply from relay');

        if (d[0] === 'NOTICE' && d.length === 2) {
          return;
        }

        if (d[0] === 'EOSE' && d.length > 1) {
          if (d[1] in subs) subs[d[1]].onEvent(null);
          return;
        }

        if (d[0] !== 'EVENT' || d.length < 3)
          throw Error('Unknown reply from relay');

        if (d[1] in subs) subs[d[1]].onEvent(d[2]);
      } catch (error) {
        console.log(error);
      }
    };

    socket.listEvents = ({ sub, ok, err }) => {
      let id = `embed-${Math.random()}`;
      const req = ['REQ', id, sub];
      socket.send(JSON.stringify(req));

      const close = () => {
        const subId = id;
        id = null;
        socket.send(JSON.stringify(['CLOSE', subId]));
        delete subs[subId];
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
        () => {
          // tell relay we're no longer interested
          close();

          // maybe relay w/o EOSE support?
          if (events.length || queue.length) {
            onEvent(null);
          } else {
            err('timeout on relay', socket.url);
          }
        },
        sub.limit && sub.limit === 1 ? 2000 : 4000
      );

      const onEvent = async (e) => {
        queue.push(e);
        if (queue.length > 1) return;
        while (queue.length) {
          // eslint-disable-next-line prefer-destructuring, no-param-reassign
          e = queue[0];
          // eslint-disable-next-line no-await-in-loop
          if (e && (await isValidEvent(e))) events.push(e);
          queue.shift(); // dequeue after we've awaited
          if (!e || (sub.limit && sub.limit === events.length)) {
            queue.splice(0, queue.length);
            done();
            break;
          }
        }
      };

      subs[id] = { ok, err, onEvent };
    };
  }

  // eslint-disable-next-line class-methods-use-this
  getEvent({ socket, sub }) {
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

  // eslint-disable-next-line class-methods-use-this
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
          this.setState({
            note: {
              error: true,
              content:
                "Sorry, we weren't able to find this note on the specified relay.",
            },
          });
        }
      })
      .catch(() => {
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
          const parsedProfile = JSON.parse(event.content);
          this.setState({ profile: parsedProfile });
        }
      })
      .catch(() => {
        this.setState({
          note: {
            error: true,
            content:
              "Sorry, there was an error fetching this user's profile from the specified relay.",
          },
        });
      });
  }

  fetchMeta({ socket, noteId }) {
    const sub = { kinds: [1, 6, 7], '#e': [noteId] };
    this.listEvents({ socket, sub }).then((events) => {
      events.forEach((event) => {
        if (event.kind === 1) {
          this.setState((state) => ({ repliesCount: state.repliesCount + 1 }));
        }
        if (event.kind === 6) {
          this.setState((state) => ({ repostsCount: state.repostsCount + 1 }));
        }
        if (event.kind === 7) {
          this.setState((state) => ({ likesCount: state.likesCount + 1 }));
        }
      });
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
