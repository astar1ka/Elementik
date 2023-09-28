const scripts = [
    'src/Timer/Timer.js',

    'src/Game/Game.js',

    'src/App.js'
];

scripts.forEach(script =>
    document.write(`<script src='${script}'></script>`));

window.onload = () => {
    App();
}