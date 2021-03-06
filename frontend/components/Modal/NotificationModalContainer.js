import { h, Component } from 'preact';
import store from '../../stores/ProfileStore';
import actions from '../../actions/ProfileActions';
import * as c from '../../constants/constants';
import request from 'superagent';
import stats from '../../helpers/stats';

import PackCard from '../Packs/PackCard';

import Modal from './Modal';

type PropsType = {
  message: {
    data: Object,
    messageID: string,
    type: string,
  },
  count: number,
  // state: Object,
}

type StateType = {
  visible: boolean,
}

export default class NotificationModalContainer extends Component {
  state = {
    visible: true
  };

  skip = (text, id) => {
    return (
      <button
        className="btn btn-primary"
        onClick={this.hide}
      >{text}</button>
    );
  };

  hide = () => {
    // $("#modal-standard").modal('hide');
    this.setState({ visible: false });
    actions.loadNews();
  };

  answer = (code, messageID) => {
    request.get(`message/action/${code}/${messageID}`);
    this.hide();
  };

  // buttons = {
  //   action: (code, messageID, style) => {
  //     return <a className="btn btn-primary" onClick={this.answer(code, messageID)}>{style.text}</a>;
  //   },
  // };

  modal_pic = (name) => {
    return <div><br /><img alt="" style="width:100%" src={`/img/${name}`} /></div>;
  };

  winningPicture = () => this.modal_pic('win_1.png');

  ratingPicture = () => this.modal_pic('win_2.jpg');

  losePicture = () => this.modal_pic('lose_1.jpg');

  getModalData = (message, info, messageID) => {
    // console.log('getModalData');
    let header = '';
    let body = '';
    let footer = '';
    let invisible = false;

    let money = store.getMoney();

    try {
      const main = (m) => (<h3>{m}</h3>);
      const close = <button className="btn btn-default" onClick={this.hide}> Закрыть </button>;

      switch (message.type) {
        case c.NOTIFICATION_GIVE_MONEY:
          header = 'Деньги, деньги, деньги!';
          body = `Вы получаете ${info.ammount}руб на счёт!`;
          footer = this.skip('Спасибо!', messageID);
          break;
        case c.NOTIFICATION_ACCEPT_MONEY:
          header = 'Бонус!';
          body = `Примите ${info.ammount}рублей на счёт!`;

          // footer = news.buttons.action(0, messageID, { text: 'Спасибо!' });
          footer = (
            <a
              className="btn btn-primary"
              onClick={() => { this.answer(0, messageID); }}
            >Спасибо</a>
          );
          break;
        case c.NOTIFICATION_CUSTOM:
          header = info.header;
          body = info.text;

          if (info.imageUrl) {
            body += this.modal_pic(info.imageUrl);
          }

          footer = this.skip('Хорошо', messageID);
          break;
        case c.NOTIFICATION_FIRST_MESSAGE:
          const mainPrize = info.mainPrize;
          header = 'С почином!';
          // 'Проверь свои знания, участвуй в турнирах, и выигрывай ценные призы!'

          body = 'Вы сыграли в первом турнире<br><br>';
          body += 'Продолжайте играть и выигрывайте призы благодаря своим знаниям!';
          footer = this.skip('ОК', messageID);
          break;
        case c.NOTIFICATION_WIN_MONEY:
          // {
          //   tournamentID : data.tournamentID,
          //   winners:winners,
          //   count:winnerCount,
          //   prizes:prizes
          // }
          console.log('messageID of NOTIFICATION_WIN_MONEY is', messageID);
          let txt = main(`Вы выиграли ${info.prizes[0]} РУБ !! Так держать!`);
          header = `Вы победили в турнире #${info.tournamentID}`;

          body = (
            <div>
              {txt}
              {this.winningPicture()}
            </div>
          );

          footer = this.skip('Урра!', messageID);
          break;
        case c.NOTIFICATION_LOSE_TOURNAMENT:
          header = `Турнир #${info.tournamentID} завершён`;
          body = main('Эх, не повезло( <br>В следующий раз точно получится!') + this.losePicture();

          footer = this.skip('Продолжить', messageID);
          break;
        case c.NOTIFICATION_CARD_GIVEN:
          // console.error('notification card given');
          header = 'Вы получаете карточку!';
          const card = info;
          body = (
            <div>
              <p className="card-title">{card.description}</p>
              <PackCard
                src={card.photoURL}
                description={card.description}
                color={card.colour}
              />
            </div>
          );

          const value = info.value || c.CARD_COLOUR_GRAY;

          footer = (
            <div>
              <button
                className="btn btn-primary"
                onClick={() => { actions.openPack(value, 1); }}
              >Открыть ещё!</button>
              {close}
            </div>
          );
          break;
        case c.NOTIFICATION_GIVE_PACK:
          header = `Вы получаете паки: ${info.count}x`;
          body = drawPackButton(info.colour);
          footer = this.skip('Урра!', messageID);
          break;
        case c.NOTIFICATION_TOURNAMENT_START:
          header = 'Турниры начинаются!';
          body = 'КНОПКИ КНОПКИ';
          footer = '';
          break;
        case c.MODAL_NO_TOURNAMENT_MONEY:
          header = 'Упс... не хватает средств';
          let diff = info.ammount - money;

          body = (
            <div className="card-title">
              Пополните счёт и вы сможете сыграть в этом турнире!
              <br />
              Стоимость участия: {info.ammount} РУБ
              <br />
              У вас на счету: {money} РУБ
            </div>
          );

          footer = (
            <div>
              <a
                href={`/Payment?ammount=${diff}&buyType=${3}`}
                className="btn btn-primary"
                onClick={stats.pressedModalTournamentNoMoney}
              >Пополнить на {diff} руб</a>
            </div>
          );
          break;
        case c.NOTIFICATION_JOIN_VK:
          header = 'Вступайте в наше сообщество, будем рады вам!';
          const groupImage = (
            <div
              style={`width: 300px; height: 300px; background-image: url('https://pp.vk.me/c628118/v628118662/30390/XgsD1vkCdHc.jpg');`}
              className="img-responsive"
            ></div>
          );
          body = (
            <div></div>
          );

          footer = (
            <div>
              {close}
            </div>
          );

          let reason;

          if (info.tournamentID) {
            reason = 'subs_tournament';
          }

          if (reason === 'subs_tournament') {
            header = 'Вступайте в наше сообщество, чтобы сыграть в этом турнире!';

            body = (
              <div>
                {groupImage}
              </div>
            );

            footer = (
              <div>
                {close}
                <a
                  className="btn btn-primary"
                  href="https://new.vk.com/o_tournaments"
                  target="_blank"
                >Перейти к сообществу</a>
              </div>
            );

          }
          break;
        case c.MODAL_NO_PACK_MONEY:
          header = 'Упс... не хватает средств';
          diff = info.ammount - money;

          body = (
            <div className="card-title">
              Пополните счёт и вы сможете открыть этот пак!
              <br />
              Стоимость пака: {info.ammount} РУБ
              <br />
              У вас на счету: {money} РУБ
            </div>
          );

          footer = (
            <div>
              <a
                href={`/Payment?ammount=${diff}&buyType=${1}`}
                className="btn btn-primary"
                onClick={stats.pressedModalPackNoMoney}
              >Пополнить на {diff} руб</a>
            </div>
          );
          break;
        default:
          console.warn('no such modal type', message.type);
          actions.report(`no such modal type ${message.type}`, 'NotificationModalContainer');
          break;
      }
    } catch (e) {
      console.error('error in modals', e);
      actions.report(e, 'NotificationModalContainer switch');
    }
    return { header, body, footer, invisible };
  };

  componentWillReceiveProps() {
    this.setState({ visible: true });
  }

  render(props: PropsType, state: StateType) {
    const { message, count } = props;
    const data = message.data || {};
    const messageID = message["_id"] || 0;

    const modalData = this.getModalData(message, data, messageID);
    const drawData = Object.assign({}, modalData, { count, messageID });

    return <Modal data={drawData} hide={!state.visible} onClose={this.hide} />;
  }
}
