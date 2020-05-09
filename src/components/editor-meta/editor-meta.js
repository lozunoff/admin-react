import React, { Component } from 'react';

export default class EditorMeta extends Component {
  constructor(props) {
    super(props);

    this.state = {
      meta: {
        title: '',
        keywords: '',
        description: '',
      },
    };
  }

  componentDidMount() {
    const { virtualDom } = this.props;
    this.getMeta(virtualDom);
  }

  componentDidUpdate(prevProps) {
    const { virtualDom } = this.props;
    if (virtualDom !== prevProps.virtualDom) {
      this.getMeta(virtualDom);
    }
  }

  onValueChange(e) {
    if (e.target.getAttribute('data-title')) {
      e.persist();
      this.setState(({ meta }) => {
        const newMeta = {
          ...meta,
          title: e.target.value,
        };

        return {
          meta: newMeta,
        };
      });
    } else if (e.target.getAttribute('data-key')) {
      e.persist();
      this.setState(({ meta }) => {
        const newMeta = {
          ...meta,
          keywords: e.target.value,
        };

        return {
          meta: newMeta,
        };
      });
    } else {
      e.persist();
      this.setState(({ meta }) => {
        const newMeta = {
          ...meta,
          description: e.target.value,
        };

        return {
          meta: newMeta,
        };
      });
    }
  }

  getMeta(virtualDom) {
    this.title = virtualDom.head.querySelector('title') || virtualDom.head.appendChild(virtualDom.createElement('title'));

    this.keywords = virtualDom.head.querySelector('meta[name="keywords"]');

    if (!this.keywords) {
      this.keywords = virtualDom.head.appendChild(virtualDom.createElement('meta'));
      this.keywords.setAttribute('name', 'keywords');
      this.keywords.setAttribute('content', '');
    }

    this.description = virtualDom.head.querySelector('meta[name="description"]');

    if (!this.description) {
      this.description = virtualDom.head.appendChild(virtualDom.createElement('meta'));
      this.description.setAttribute('name', 'description');
      this.description.setAttribute('content', '');
    }

    this.setState({
      meta: {
        title: this.title.innerHTML,
        keywords: this.keywords.getAttribute('content'),
        description: this.description.getAttribute('content'),
      },
    });
  }

  applyMeta() {
    const { meta } = this.state;
    this.title.innerHTML = meta.title;
    this.keywords.setAttribute('content', meta.keywords);
    this.description.setAttribute('content', meta.description);
  }

  render() {
    const { modal, target } = this.props;
    const { meta: { title, keywords, description } } = this.state;

    return (
      <div id={target} uk-modal={modal.toString()}>
        <div className="uk-modal-dialog uk-modal-body">
          <h2 className="uk-modal-title">Редактирование Meta-тэгов</h2>

          <form>
            <div className="uk-margin">
              <input
                data-title
                className="uk-input"
                type="text"
                placeholder="Title"
                value={title}
                onChange={(e) => this.onValueChange(e)}
              />
            </div>

            <div className="uk-margin">
              <textarea
                data-key
                className="uk-textarea"
                rows="5"
                placeholder="Keywords"
                value={keywords}
                onChange={(e) => this.onValueChange(e)}
              />
            </div>

            <div className="uk-margin">
              <textarea
                data-descr
                className="uk-textarea"
                rows="5"
                placeholder="Description"
                value={description}
                onChange={(e) => this.onValueChange(e)}
              />
            </div>
          </form>

          <p className="uk-text-right">
            <button className="uk-button uk-button-default uk-modal-close uk-margin-small-right" type="button">Отменить</button>
            <button className="uk-button uk-button-primary uk-modal-close" type="button" onClick={() => this.applyMeta()}>Применить</button>
          </p>
        </div>
      </div>
    );
  }
}
