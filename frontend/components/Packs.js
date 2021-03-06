import { h, Component } from 'preact';
import Card from './Packs/PackCard';
import PackPrize from './Packs/PackPrize';
import PackGallery from './Packs/PackGallery';

import actions from '../actions/ProfileActions';

import InfoStore from '../stores/InfoStore';

import c from '../constants/constants';

function openPack(packID, pay) {
  console.log('openPack pack page', packID, pay);
  actions.openPack(packID, pay);
}

export default class PackPage extends Component {
  state = {
    chosenPack: -1,
    allPacks: []
  };

  componentWillMount() {
    // actions.initialize();

    InfoStore.addChangeListener(() => {
      this.setState({
        allPacks: InfoStore.getPacks(),
        cards: InfoStore.getGifts()
      })
    })
  }

  chosePack(id) {
    this.setState({ chosenPack: id });
    window.scrollTo(0, 0);
  }

  choseAnother() {
    this.setState({ chosenPack: -1 });
  }

  render(props, state) {
    const { chosenPack } = state;

    if (chosenPack < 0) {
      return (
        <div className="white text-center">
          <PackGallery chosePack={this.chosePack.bind(this)} packs={this.state.allPacks} />
        </div>
      );
    }

    // <div className="col-sm-3 col-md-3 col-xs-12">

    const packIndex = state.allPacks.findIndex(p => p.packID === chosenPack);

    if (packIndex < 0) {
      return 'Pack error. Press F5 to retry. If it continues, write to support';
    }

    const pack = state.allPacks[packIndex];

    const CardList = pack.items.slice().reverse().map((giftID, i) => {
      const card = InfoStore.getGiftByGiftID(giftID);
      const color = c.CARD_COLOUR_RED;
      return (
        <div className="col-md-4 col-sm-6 col-xs-12">
          <PackPrize
            name={card.name}
            description={card.description}
            src={card.photoURL}
            color={color}
          />
        </div>
      )
    });
    // style="margin: 0 auto; display: block;"
    const pricePhrase =  pack.price ? `за ${pack.price} руб`: 'бесплатно';

    return (
      <div>
        <div className="white text-center">
          <div>
            <div className="row pack-container" style="margin-top: 15px;">
              <div
                className="pack img-wrapper"
                style={`margin-bottom: 0px; background-image: url(${pack.image});`}
              ></div>
              <br />
              <br />
              <button
                className="btn btn-primary btn-lg btn-block"
                style="border-radius: 0;"
                onClick={() => { actions.openPack(chosenPack); }}
              >Открыть пак {pricePhrase}</button>
            </div>
            <br />
            <a onClick={this.choseAnother.bind(this)} className="pointer-no-underline">
              выбрать другой пак
            </a>
            <br />

            <h1 className="text-center"> Что может выпасть в паке? </h1>
            <div className="col-sm-12 col-md-12 col-xs-12 killPaddings">
              {CardList}
            </div>
          </div>
        </div>
      </div>
    );
  }
}
