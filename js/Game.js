requirejs.config({
    baseUrl: 'js',
    paths: {
        jquery: 'libs/jquery-2.1.4.min',
        Board: 'models/Board',
        Ball: 'models/Ball',
        Cell: 'models/Cell',
        Pad: 'models/Pad'
    }
});

// require dependencies
requirejs(['jquery', 'Board', 'Ball', 'Cell', 'Pad'], function($) {

    var canvas = document.getElementById('gameBoard');

    // try to get the canvas. we gonna need it!
    if (canvas.getContext) {

        var board;

        var lives = 3;
        var leftDown = false;
        var rightDown = false;
        var touchX = false;

        // first game setup
        function init() {
            // set canvas to fill the window
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;

            // create our board logic
            board = new Board(canvas.getContext('2d'));
            board.init();

            // reset lives
            lives = 3;

            // reset button presses
            leftDown = false;
            rightDown = false;
            touchX = false;

            // run forever
            return window.requestAnimationFrame(draw);
        }

        // draw a frame
        function draw() {
            // clear everything
            board.clear();

            // make the ball move
            board.moveBall();

            // if keys/touch are pressed, move the pad
            if (leftDown) {
                board.movePadLeft();
            }
            else if (rightDown) {
                board.movePadRight();
            }
            else if (touchX) {
                board.movePadTo(touchX);
            }

            // draw all board elements
            board.drawElements();


            // dropped the ball?
            if (board.missPad) {
                // stop game
                window.cancelAnimationFrame(game);

                // do we have more lives?
                if (--lives) {
                    // reset the ball and pad
                    board.addPad();
                    board.addBall();
                    // continue game
                    game = window.requestAnimationFrame(draw);
                }
                else {
                    // game failed
                    // (force redraw scene)
                    board.clear();
                    board.drawElements();

                    alert('Game Failed :(');

                    // restart after alert is dismissed
                    game = init();
                }
                return;
            }

            // no more cells to destroy?
            if (board.noMoreCells && lives) {
                // stop game
                window.cancelAnimationFrame(game);

                // (force redraw scene)
                board.clear();
                board.drawElements();

                // game won!
                alert('YOU WON THE GAME!');

                // restart after alert is dismissed
                game = init();
                return;
            }

            // game loop
            game = window.requestAnimationFrame(draw);
        }

        // start the game
        var game = init();


        // key events
        $(document).on('keydown', function(ev) {
            if (ev.keyCode == 37) leftDown = true;
            else if (ev.keyCode == 39) rightDown = true;
        });

        $(document).on('keyup', function(ev) {
            if (ev.keyCode == 37) leftDown = false;
            else if (ev.keyCode == 39) rightDown = false;
        });


        // touch events
        $(document).on('touchmove', function(ev) {
            ev.preventDefault();
            touchX = ev.originalEvent.touches[0].pageX;
        });

        $(document).on('touchend', function(ev) {
            ev.preventDefault();
            touchX = false;
        });


        // reset whole game on window resize
        $(window).resize(function() {
            window.cancelAnimationFrame(game);
            game = init();
        })
    }
    // Oopsy, no canvas support :(
    else {
        alert("Sorry, <canvas> is not supported in your browser!")
    }
});
