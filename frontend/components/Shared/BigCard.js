import { h, Component } from 'preact';
import BaseCard from './BaseCard';

type PropsType = {
  color: string,
  image: string,
  style: string,
  content: Component,
}

export default class Card extends Component {
  render(props: PropsType) {
    // const className = `card ${props.style}`;
    // const style = "width: 280px; display: inline-block;";

    const className = `center ${props.style}`;
    const style = "min-height: 250px; overflow: hidden";

    return (
      <BaseCard className={className} style={style} content={props.content} />
    );
  }
}
