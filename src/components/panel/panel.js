import React from 'react';

const Panel = () => (
  <div className="panel">
    <button className="uk-button uk-button-primary uk-margin-small-right" uk-toggle="target: #modal-open" type="button">Открыть</button>
    <button className="uk-button uk-button-primary uk-margin-small-right" uk-toggle="target: #modal-save" type="button">Опубликовать</button>
    <button className="uk-button uk-button-primary uk-margin-small-right" uk-toggle="target: #modal-meta" type="button">Редактировать META</button>
    <button className="uk-button uk-button-default uk-margin-small-right" uk-toggle="target: #modal-backup" type="button">Восстановить</button>
    <button className="uk-button uk-button-danger" uk-toggle="target: #modal-logout" type="button">Выйти</button>
  </div>
);

export default Panel;
