import { h, Component } from 'preact';
import request from 'superagent';
import actions from '../../actions/ProfileActions';

type PropsType = {
  data: {
    header: ?Component,
    body: ?Component,
    footer: ?Component,
    count: number,
    messageID: number,
  },

  hide: Boolean,

  // buttons: Array<Component>,
  // onClick: Function,
  onClose: Function,
}

export default class Modal extends Component {
  componentWillMount() {}

  markAsRead = id => {
    console.log('Modal markAsRead', id);
    request
      .post('/message/shown')
      .send({ id })
      .end((err, res) => {
        if (err) throw err;
        // console.log('Modal markAsRead callback', id, err, res);
        // actions.loadNews();
      });
  };

  render(props: PropsType) {
    let title = props.data.header;
    if (props.data.count > 1) title += ` (${props.data.count})`;
    const messageID = props.data.messageID;

    if (messageID) this.markAsRead(messageID);

    // const modalID = `modal-standard${messageID}`;
    const modalID = 'modal-standard';
    /*
     <script>
     $("#" + modalID).modal(props.hide ? 'hide' : 'show');
     </script>
      <div id={modalID} className="modal fade in" role="dialog">
     */
                // onClick={props.onClose}
      // <div id={modalID} className={`modal ${className}`} role="dialog">
    const className = props.hide ? 'modal fade hide' : 'modal show';
      // <div style={{ display: props.hide ? 'none' : 'block' }}>
      // <div id={modalID} className="modal fade" role="dialog">
    return (
      <div id={modalID} className={className} role="dialog">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <button
                type="button"
                className="close"
                data-dismiss="modal"
                style="font-size: 40px;"
                onClick={props.onClose}
              > &times;</button>
              <h4 className="modal-title"> {title} </h4>
            </div>
            <div className="modal-body" id="cBody">{props.data.body}</div>
            <div className="modal-footer" id="cFooter">{props.data.footer}</div>
          </div>
        </div>
      </div>
    );
  }
}
        // {$(`#${modalID}`).modal(props.hide ? 'hide' : 'show')}
