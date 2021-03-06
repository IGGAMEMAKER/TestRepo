/**
 * Created by gaginho on 22.05.16.
 */
import { h, Component } from 'preact';
import request from 'superagent';

type PropsType = {
  name: string,
  description: string,
  type: number,
  src: string,
  color: string,
};

export default function (props: PropsType): Component {
  let style = {};
  if (props.color > -1) {
    style['background-image'] = `url('/img/cardLayers/${props.color}.jpg')`;
  }
  // width="283" height="238"
  // <p className="card-name white">{props.name}</p>
  return (
    <div className="pack-cover">
      <img
        border="0"
        alt=""
        className="pack-card pack-wrapper"
        style={style}
        src={props.src}
      />
      <p className="card-description">{props.description}</p>
    </div>
  );
}
