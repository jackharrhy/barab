const shortid = require('shortid');
const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs-extra');
const {spawn} = require('child_process');

const app = express();
const port = 3000;

app.use(bodyParser.text());

const f = (p) => `/tmp/${p}`;

app.post('/', async (req, res) => {
  res.type('text/plain');

  const filename = shortid.generate();

  const v = f(`${filename}.v`);
  const bin = f(filename);

  await fs.writeFile(v, req.body, 'utf8');

  console.log(filename);

  function handleVVP() {
    let output = '';
    const vvp = spawn('vvp', [bin]);

    const vvpKiller = setTimeout(() => {
      vvp.kill('SIGINT');
      output += '\n\ntook too long to run!\n';
      res.send(output);
    }, 3000);

    vvp.stdout.on('data', (data) => {
      output += data;
      console.log(`vvp stdout: ${data}`);
    });

    vvp.stderr.on('data', (data) => {
      console.error(`vvp stderr: ${data}`);
    });

    vvp.on('close', () => {
      clearTimeout(vvpKiller);
      res.send(output);
    });
  }

  const iverilog = spawn('iverilog', ['-o', bin, v]);

  const iverilogKiller = setTimeout(() => {
    res.send('took too long to compile!');
    iverilog.kill('SIGINT');
  }, 3000);

  iverilog.stdout.on('data', (data) => {
    console.log(`iverilog stdout: ${data}`);
  });

  iverilog.stderr.on('data', (data) => {
    console.error(`iverilog stderr: ${data}`);
  });

  iverilog.on('close', () => {
    clearTimeout(iverilogKiller);
    handleVVP();
  });
});

app.listen(port, () => console.log(`barab listening on port ${port}!`));
