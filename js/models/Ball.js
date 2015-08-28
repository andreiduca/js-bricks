function Ball() {

    this.radius;
    this.x;
    this.y;
    this.speedX;
    this.speedY;

    this.move = function() {
        this.x += this.speedX;
        this.y += this.speedY;
    }

}
