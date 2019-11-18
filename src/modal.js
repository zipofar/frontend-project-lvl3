import Modal from 'bootstrap/js/dist/modal';

export default (props, closeHandler) => {
  const {
    title,
    description,
    parentEl,
  } = props;

  const attributes = {
    class: 'modal',
    tabindex: '-1',
    role: 'dialog',
  };

  const modalBody = `
    <div class="modal-dialog" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">${title}</h5>
          <button type="button" class="close" action="close" data-dismiss="modal" aria-label="Close">
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
        <div class="modal-body">
          <p>${description}</p>
        </div>
        <div class="modal-footer">
          <button type="button" action="close" class="btn btn-secondary" data-dismiss="modal">Close</button>
        </div>
      </div>
    </div>
  `;

  const modalEl = document.createElement('div');

  Object.keys(attributes).forEach((key) => { modalEl.setAttribute(key, attributes[key]); });
  modalEl.innerHTML = modalBody;
  parentEl.appendChild(modalEl);

  const closeBtnsEl = modalEl.querySelectorAll('button[action="close"]');
  closeBtnsEl.forEach((e) => {
    e.onclick = () => {
      closeHandler();
      modalEl.remove();
    };
  });

  const modal = new Modal(modalEl);
  modal.show();
};
