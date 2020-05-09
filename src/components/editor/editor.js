import React, { Component } from 'react';
import axios from 'axios';
import UIkit from 'uikit';

import '../../helpers/iframeLoader';
import DOMHelper from '../../helpers/dom-helper';
import EditorText from '../editor-text';
import Spinner from '../spinner';
import ConfirmModal from '../confirm-modal';
import ChooseModal from '../choose-modal';
import Panel from '../panel';
import EditorMeta from '../editor-meta';
import EditorImages from '../editor-images';
import Login from '../login';

export default class Editor extends Component {
  currentPage = 'index.html';

  state = {
    pageList: [],
    backupsList: [],
    loading: true,
    auth: false,
    loginError: false,
    loginLengthError: false,
  };

  componentDidMount() {
    this.checkAuth();
  }

  componentDidUpdate(prevProps, prevState) {
    const { auth } = this.state;
    if (auth !== prevState.auth) {
      this.init(null, this.currentPage);
    }
  }

  checkAuth = () => {
    axios
      .get('./api/checkAuth.php')
      .then((res) => {
        this.setState({
          auth: res.data.auth,
        });
      });
  }

  login = (pass) => {
    if (pass.length > 5) {
      axios
        .post('./api/login.php', { password: pass })
        .then((res) => {
          this.setState({
            auth: res.data.auth,
            loginError: !res.data.auth,
            loginLengthError: false,
          });
        });
    } else {
      this.setState({
        loginError: false,
        loginLengthError: true,
      });
    }
  }

  logout = () => {
    axios
      .get('./api/logout.php')
      .then(() => {
        window.location.replace('/');
      });
  }

  init = (e, page) => {
    if (e) {
      e.preventDefault();
    }

    const { auth } = this.state;

    if (auth) {
      this.isLoading();
      this.iframe = document.querySelector('iframe');
      this.open(page, this.isLoaded);
      this.loadPageList();
      this.loadBackupsList();
    }
  }

  open = (page, callback) => {
    this.currentPage = page;

    axios
      .get(`../${page}?rnd=${Math.random()}`)
      .then((res) => DOMHelper.parseStrToDOM(res.data))
      .then(DOMHelper.wrapTextNodes)
      .then(DOMHelper.wrapImages)
      .then((dom) => {
        this.virtualDom = dom;
        return dom;
      })
      .then(DOMHelper.serializeDOMToString)
      .then((html) => axios.post('./api/saveTempPage.php', { html }))
      .then(() => this.iframe.load('../ughn_fj648jfoo.html'))
      .then(() => axios.post('./api/deleteTempPage.php'))
      .then(() => this.enableEditing())
      .then(() => this.injectStyles())
      .then(callback);

    this.loadBackupsList();
  }

  save = async () => {
    this.isLoading();
    const newDom = this.virtualDom.cloneNode(this.virtualDom);
    DOMHelper.unwrapTextNodes(newDom);
    DOMHelper.unwrapImages(newDom);
    const html = DOMHelper.serializeDOMToString(newDom);

    await axios
      .post('./api/savePage.php', { pageName: this.currentPage, html })
      .then(() => this.showNotifications('Успешно сохранено', 'success'))
      .catch(() => this.showNotifications('Ошибка сохранения', 'danger'))
      .finally(this.isLoaded);

    this.loadBackupsList();
  }

  enableEditing = () => {
    this.iframe.contentDocument.body.querySelectorAll('text-editor').forEach((element) => {
      const id = element.getAttribute('nodeid');
      const virtualElement = this.virtualDom.body.querySelector(`[nodeid="${id}"]`);

      new EditorText(element, virtualElement);
    });

    this.iframe.contentDocument.body.querySelectorAll('[editableimgid]').forEach((element) => {
      const id = element.getAttribute('editableimgid');
      const virtualElement = this.virtualDom.body.querySelector(`[editableimgid="${id}"]`);

      // eslint-disable-next-line max-len
      new EditorImages(element, virtualElement, this.isLoading, this.isLoaded, this.showNotifications);
    });
  }

  injectStyles = () => {
    const style = this.iframe.contentDocument.createElement('style');

    style.innerHTML = `
            text-editor:hover {
                outline: 3px solid orange;
                outline-offset: 8px;
            }
            
            text-editor:focus {
                outline: 3px solid red;
                outline-offset: 8px;
            }
            
            [editableimgid]:hover {
                outline: 3px solid orange;
                outline-offset: 8px;
            }
        `;

    this.iframe.contentDocument.head.appendChild(style);
  }

  showNotifications = (message, status) => {
    UIkit.notification({
      message,
      status,
    });
  }

  loadPageList = () => {
    axios
      .get('./api/pageList.php')
      .then((res) => this.setState({ pageList: res.data }));
  }

  loadBackupsList = () => {
    axios
      .get('../backups/backups.json')
      .then((res) => {
        this.setState({
          backupsList: res.data.filter((backup) => backup.page === this.currentPage),
        });
      })
      .catch(() => {
        throw new Error('File "backups.json" not found!');
      });
  }

  restoreBackup = (e, backup) => {
    if (e) {
      e.preventDefault();
    }
    UIkit.modal.confirm('Вы действительно хотите восстановить страницу из этой резервной копии? '
      + 'Все несохраненные данные будут потеряны!', { labels: { ok: 'Восстановить', cancel: 'Отмена' } })
      .then(() => {
        this.isLoading();
        return axios
          .post('./api/restoreBackup.php', { page: this.currentPage, file: backup });
      })
      .then(() => {
        this.open(this.currentPage, this.isLoaded);
      });
  }

  isLoading = () => {
    this.setState({
      loading: true,
    });
  }

  isLoaded = () => {
    this.setState({
      loading: false,
    });
  }

  render() {
    const {
      loading,
      pageList,
      backupsList,
      auth,
      loginError,
      loginLengthError,
    } = this.state;

    const modal = true;

    const spinner = loading ? <Spinner active /> : <Spinner />;

    if (!auth) {
      // eslint-disable-next-line max-len
      return <Login login={this.login} loginError={loginError} loginLengthError={loginLengthError} />;
    }

    return (
      <>
        <iframe src="" frameBorder="0" title="page" />

        <input id="img-upload" type="file" accept="image/*" style={{ display: 'none' }} />

        {spinner}

        <Panel />

        <ConfirmModal
          modal={modal}
          target="modal-save"
          method={this.save}
          text={{
            title: 'Сохранение',
            descr: 'Вы действительно хотите сохранить изменения?',
            btn: 'Опубликовать',
          }}
        />

        <ConfirmModal
          modal={modal}
          target="modal-logout"
          method={this.logout}
          text={{
            title: 'Выход',
            descr: 'Вы действительно хотите выйти?',
            btn: 'Выйти',
          }}
        />

        <ChooseModal modal={modal} target="modal-open" data={pageList} redirect={this.init} />
        <ChooseModal modal={modal} target="modal-backup" data={backupsList} redirect={this.restoreBackup} />

        {this.virtualDom ? <EditorMeta modal={modal} target="modal-meta" virtualDom={this.virtualDom} /> : false}
      </>
    );
  }
}
