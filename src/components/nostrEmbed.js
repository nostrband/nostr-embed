import { Component } from 'preact';
import { relayInit } from 'nostr-tools';
import Profile from './profile';
import Meta from './meta';
import style from './style.css';

class NosrtEmbed extends Component {
  constructor(props) {
    super(props);
    this.state = {
      noteId: props.noteId,
      note: {},
      profile: {},
      profilePkey: '',
      likesCount: 0,
      repostsCount: 0,
      repliesCount: 0,
    };
  }

  async componentDidMount() {
    // let relay = relayInit('wss://relay.nostr.band');
    let relay = relayInit('wss://relay.damus.io');
    await relay.connect();

    relay.on('connect', () => {
      this.fetchNote({ relay });
      console.log(`Connected to Nostr relay: ${relay.url}`);
    });

    relay.on('error', () => {
      console.log(`Failed to connect to Nostr relay: ${relay.url}`);
    });
  }

  async fetchNote({ relay }) {
    relay
      .get({ ids: [this.state.noteId] })
      .then((event) => {
        if (event) {
          this.setState({
            note: event,
            profilePkey: event.pubkey,
          });
          this.fetchProfile({ relay, profilePkey: event.pubkey });
          this.fetchMeta({ relay, noteId: this.state.noteId });
        } else {
          console.log("Error: We can't find that note on this relay");
        }
      })
      .catch((error) => {
        console.log(`Error fetching note: ${error}`);
      });
  }

  async fetchProfile({ relay, profilePkey }) {
    relay
      .list([{ kinds: [0], authors: [profilePkey] }])
      .then((events) => {
        events.sort((a, b) => b.created_at - a.created_at);
        let profile = events[0];
        let parsedProfile = JSON.parse(profile.content);
        this.setState({ profile: parsedProfile });
      })
      .catch((error) => {
        console.log(`Error fetching profile: ${error}`);
      });
  }

  async fetchMeta({ relay, noteId }) {
    relay
      .list([
        {
          kinds: [1, 6, 7],
          '#e': [noteId],
        },
      ])
      .then((events) => {
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
        <div class="cardContent">{this.state.note.content}</div>
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
