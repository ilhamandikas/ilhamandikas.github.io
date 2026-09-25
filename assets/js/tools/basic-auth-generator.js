// HTTP Basic Authorization header builder.
const { tk } = window;

const user = document.querySelector('#ba-user');
const pass = document.querySelector('#ba-pass');
const output = document.querySelector('#ba-output');

tk.live([user, pass], () => {
  output.value = `Basic ${tk.b64encode(`${user.value}:${pass.value}`)}`;
});
