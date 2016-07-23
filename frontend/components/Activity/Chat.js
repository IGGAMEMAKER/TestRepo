import { h, Component } from 'preact';
import request from 'superagent';
import store from '../../stores/ProfileStore';
import actions from '../../actions/ProfileActions';

type PropsType = {
  support: boolean
};

type MessageType = {
  sender: string,
  text: string
}

type StateType = {
  messages: Array<MessageType>,
  text: string
};

type ResponseType = {
  body: {
    msg: Array<MessageType>
  }
};

export default class Chat extends Component {
  state = {
    messages: [],
    text: ''
  };

  componentWillMount() {
    const props: PropsType = this.props;

    store.addChangeListener(() => {
      console.log('Chat addChangeListener');
      this.setState({
        messages: props.support ? store.getSupportMessages() : store.getChatMessages()
      });
    });

    if (props.support) {
      this.loadSupportMessages();
    } else {
      this.loadMessages();
    }
  }

  appendMessage = (sender, text) => {
    // $("#messages").append($("<p>").text(login + " : " + text));
    this.scrollToMessageEnd();
    const messages = this.state.messages;
    messages.push({ sender, text });
    this.setMessages(messages);
  };

  setMessages = (messages) => {
    this.setState({ messages });
  };

  loadMessages = () => {
    actions.loadChatMessages();
    setTimeout(this.scrollToMessageEnd, 100);
  };

  loadSupportMessages = () => {
    actions.loadSupportMessages();
    setTimeout(this.scrollToMessageEnd, 100);
  };

  scrollToMessageEnd = () => {
    setTimeout(() => {
      const elem = document.getElementById('messages');
      elem.scrollTop = elem.scrollHeight;
    }, 100);
  };

  getText = () => {
    const text = document.getElementById('m').value;
    console.log(text);
    this.setState({ text });
  };

  sendMessage = () => {
    // console.log('sendMessage');
    const props: PropsType = this.props;

    const text = this.state.text;
    this.scrollToMessageEnd();
    if (!text) return;

    // actions.sendMessage(text, login || 'nil');
    // this.state.socket.emit('chat message', { text, login });

    if (props.support) {
      socket.emit('support', { text, login });
    } else {
      socket.emit('chat message', { text, login });
    }
    this.setState({ text: '' });
  };

  onEnter = (e) => {
    const KEY_CODE_ENTER = 13;
    if (e.keyCode === KEY_CODE_ENTER) {
      this.sendMessage();
    }
  };

  render(props: PropsType, state: StateType) {
    const messageList = state.messages
      .map((m: MessageType, i: number, arr: Array) => {
        if (!m) return '';
        let style = '';
        if (m.sender === login) {
          style = 'color: gold;';
        }
        const text = `${m.sender || 'Гость'}: ${m.text}`;

        if (i === arr.length - 1) {
          return <p id="chat" className="chat-text" style={style}>{text}</p>;
        }

        return <p className="chat-text" style={style}>{text}</p>;
      });
    /*
      <link rel="stylesheet" type="text/css" href="/css/chat1.css" />
    */
    return (
      <div className="full" style="max-width: 600px;">
        <h2 className="page">Чат</h2>
        <ul id="messages" style="max-height:300px; overflow:auto;">
          {messageList}
        </ul>
        <input
          id="m"
          className="circle-input full"
          style=""
          autoComplete="off"
          onInput={this.getText}
          onKeyDown={this.onEnter}
          value={state.text}
        >{state.text}</input>
        <br />
        <button
          className="btn btn-primary btn-lg"
          onClick={this.sendMessage}
          style="margin-top: 10px;"
        >Отправить</button>
      </div>
    );
  }
}
