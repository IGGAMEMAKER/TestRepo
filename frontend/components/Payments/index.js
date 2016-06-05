/**
 * Created by gaginho on 06.06.16.
 */
import { h, Component } from 'preact';
import request from 'superagent';

type PropsType = {
  ammount: number,
  buyType: number,
};

export default class Payment extends Component {
  state = { };

  componentWillMount() {
    // this.loadData();
  }

  loadData() {
    request
      .get('/api/teams/')
      .end((err: String, res) => {
        const message: PropsType = res.body;
        console.log('got request', err, message);

        this.setState({ joined: message.joined, team: message.team });
      });
  }

  payform = (value, text, paymentType) => {
    /*
     label Яндекс.Деньгами
     input(type="radio" name="paymentType" value="PC")
     label Банковской картой
     input(type="radio" name="paymentType" value="AC")
     label С мобильного
     input(type="radio" name="paymentType" value="MC")
     input(type="submit" id="depositLink1" class="btn btn-lg btn-primary" value="Оплатить " + value+ " руб")
     */
    return (
      <form id="form-928" method="POST" action="https://money.yandex.ru/quickpay/confirm.xml" noValidate>
        <div className="form-group">
          <input type="hidden" name="receiver" value="410013860652119" />
          <input type="hidden" name="formcomment" value="Пополнение счёта в online-tournaments.org" />
          <input type="hidden" name="short-dest" value="Пополнение счёта в online-tournaments.org" />
          <input type="hidden" id="userLogin" name="label" value={login} />
          <input type="hidden" name="quickpay-form" value="shop" />
          <input type="hidden" id="targets" name="targets" value={`Пополнение счёта у ${login}`} />
          <input type="hidden" id="sumAttribute" name="sum" value={value} data-type="number" />
          <input type="hidden" name="comment" value="Платёж принят!" />
          <h2 className="page">{text}</h2>
          <input type="hidden" name="paymentType" value={paymentType} />
          <input type="submit" className="btn btn-lg btn-primary" value={`Оплатить ${value} руб`} />
        </div>
      </form>
    );
  };

  render(props: PropsType) {
    return (
      <div>
        <h1 className="page">Пополнение счёта</h1>
        <h2 className="page">Вы собираетесь пополнить счёт на {props.ammount} руб</h2>
        <h3 className="page">Вы можете сделать это несколькими способами: </h3>
        <h2 className="page">
          QIWI: +79648847260 (обязательно укажите ваш логин {login})
        </h2>
        <hr colour="white" width="60%" align="center" />
        {this.payform(100, 'Яндекс.Деньгами', 'PC')}
        <hr colour="white" width="60%" align="center" />
        {this.payform(100, 'Банковской картой', 'AC')}
        <hr colour="white" width="60%" align="center" />
        {this.payform(100, 'С мобильного', 'MC')}
        <hr colour="white" width="60%" align="center" />
      </div>
    );
  }
}
