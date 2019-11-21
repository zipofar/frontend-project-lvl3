const setState = (state) => {
  const actions = {
    enabled: '',
    disabled: 'disabled',
  };
  return actions[state];
};


export default (props, handler) => {
  const { parentEl, state } = props;
  const btnBody = `
    <button
      ${setState(state)}
      class="btn btn-outline-success my-2 my-sm-0"
      id="btn-add"
      type="submit"
    >
      Add
    </button>
  `;
  parentEl.innerHTML = btnBody;
};
