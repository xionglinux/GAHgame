// Player class definition
class Player{
    constructor(playerID, playerName, hotelID) {
        // init player basic info
        this.playerID = playerID;
        this.playerName = playerName;
        console.log("create new player " + this.playerID + " " + this.playerName);
        switch(this.playerID){
            case 0: this.canvas = player0Canvas; this.context = player0Context; this.markerColor = "blue";   /*console.log("link to canvas 0");*/ break;
            case 1: this.canvas = player1Canvas; this.context = player1Context; this.markerColor = "red";    /*console.log("link to canvas 1");*/ break;
            case 2: this.canvas = player2Canvas; this.context = player2Context; this.markerColor = "yellow"; /*console.log("link to canvas 2");*/ break;
            case 3: this.canvas = player3Canvas; this.context = player3Context; this.markerColor = "grey";   /*console.log("link to canvas 3");*/ break;
        }
        this.turnFlag = false; // assert when it's this player's turn
        this.endFlag = false; // game class wait for this flag to go to next turn
        this.miniTurn = [0, 0];
        this.diceTaken = [-1, -1];
        this.firstGuestTurn = true; // whether at the first-guest-picking turn
        this.opInvite = true;
        this.opAction = false;
        this.opServe = false;
        this.opCheckout = false;
        this.opEnd = false;
        this.atInvite = false;
        this.atAction = false;
        this.atServe = false;
        this.atCheckout = false;
        this.atTakeBrownWhite = false;
        this.atTakeRedBlack = false;
        this.atPrepareRoom = false;
        this.atRoyalMoney = false;
        this.atHireServer = false;
        this.atTakeMirror = false;
        this.atTakeBrown = 0;
        this.atTakeWhite = 0;
        this.atTakeRed = 0;
        this.atTakeBlack = 0;
        this.atRoomToPrepare = 0;
        this.atRoyal = 0;
        this.atMoney = 0;
        this.atHireServerdiscount = 0;
        this.atMirrorDice = 1;
        this.atActionBoost = false;
        this.inviteFlag = false; // whether already invited this turn
        this.actionFlag = false; // whether already took dice this turn
        this.hireFlag = false;
        this.gamePoint = 0;
        this.royalPoint = 0;
        this.hotelID = hotelID;
        this.food = 4;
        this.brown = 1;
        this.white = 1;
        this.red = 1;
        this.black = 1;
        this.money = 10;
        this.numServerOnHand = 0;
        this.numServerHired = 0;
        this.serverOnHand = []; // empty hand at first, waiting for top to give servers
        this.serverOnHandCanvasIdx = 0;
        this.serverHired = [];
        this.serverHiredCanvasIdx = 0;
        this.serverOnHandHighLightFlag = false;
        this.serverOnHandHighLight = [];
        this.hotel = new Hotel(hotelID); // prepare hotel
        // line canvas clicking
        // this.canvas.addEventListener("click", this.handlePlayerClick);
        // draw the player board
        this.updatePlayerCanvas(this.context);
        // draw the server board
        this.updateServerCanvas(serverContext);
    }

    handlePlayerClick(event) {
        // check if this event is invite
        if(event.offsetX >= 712 && event.offsetX <= 752 && event.offsetY >= 10 && event.offsetY <= 30){
            console.log("Invite button pressed");
            if(this.opInvite){
                // disable all 
                this.disableAllOp();
                this.atInvite = true;
                this.updatePlayerCanvas(this.context);
                return 1;
            }
        }

        // check if this event is action
        if(event.offsetX >= 757 && event.offsetX <= 797 && event.offsetY >= 10 && event.offsetY <= 30){
            console.log("Action button pressed");
            if(this.opAction){
                // disable all
                this.disableAllOp();
                this.atAction = true;
                this.updatePlayerCanvas(this.context);
            }
            return 2;
        }

        // check if this event is serve
        if(event.offsetX >= 802 && event.offsetX <= 842 && event.offsetY >= 10 && event.offsetY <= 30){
            console.log("Serve button pressed");
            return 3;
        }

        // check if this event is checkout
        if(event.offsetX >= 847 && event.offsetX <= 887 && event.offsetY >= 10 && event.offsetY <= 30){
            console.log("Checkout button pressed");
            return 4;
        }

        // check if this event is end
        if(event.offsetX >= 892 && event.offsetX <= 932 && event.offsetY >= 10 && event.offsetY <= 30){
            console.log("End button pressed");
            if(this.opEnd){
                this.endFlag = true;
            }
            return 5;
        }

        // no button pressed
        return 0;
    }

    checkOpStatus() {
        // check operation availability based on player status
        // No op other than invite available at the first guest picking round
        this.opInvite = !this.inviteFlag;
        this.opAction = !this.actionFlag && !this.firstGuestTurn;
        this.opServe = (this.money > 0) && (this.food > 0) && !this.firstGuestTurn;
        this.opCheckout = false;
        if(!this.firstGuestTurn){
            for(let i=0; i<this.hotel.numGuestOnTable; i++){
                if(this.hotel.guestOnTable[i].guestSatisfied){
                    this.opCheckout = true;
                }
            }
        }
        // first guest round, need to invite a guest and prepare 3 rooms
        this.opEnd = this.firstGuestTurn ? (this.inviteFlag && (this.hotel.roomPreparedNum == 3)) : this.actionFlag;
    }

    disableAllOp() {
        // turn off all operation buttons
        // when one op selected
        // call checkOpStatus to turn on when op finished
        this.opInvite = false;
        this.opAction = false;
        this.opServe = false;
        this.opCheckout = false;
        this.opEnd = false;
    }

    actionTakeBrownWhite(value) {
        alertCanvas.style.display = 'block';
        this.atTakeBrownWhite = true;
        // default maximum white
        this.atTakeWhite = Math.floor(value/2);
        this.atTakeBrown = value - this.atTakeWhite;
        this.updateAlertCanvas(alertContext, 0);
    }

    actionTakeRedBlack(value) {
        alertCanvas.style.display = 'block';
        this.atTakeRedBlack = true;
        // default maximum white
        this.atTakeBlack = Math.floor(value/2);
        this.atTakeRed = value - this.atTakeBlack;
        this.updateAlertCanvas(alertContext, 1);
    }

    actionPrepareRoom(value) {
        alertCanvas.style.display = 'block';
        this.atPrepareRoom = true;
        // default maximum white
        this.atRoomToPrepare = value;
        this.updateAlertCanvas(alertContext, 2);
    }

    actionTakeRoyalMoney(value) {
        alertCanvas.style.display = 'block';
        this.atRoyalMoney = true;
        // default maximum white
        this.atRoyal = value;
        this.atMoney = 0;
        this.updateAlertCanvas(alertContext, 3);
    }

    actionHireServer(value) {
        alertCanvas.style.display = 'block';
        this.atHireServer = true;
        // default maximum white
        this.atHireServerdiscount = value;
        this.updateAlertCanvas(alertContext, 4);
    }

    actionTakeMirror(value) {
        alertCanvas.style.display = 'block';
        this.atTakeMirror = true;
        // default maximum white
        this.atMirrorStrength = value;
        this.atMirrorDice = 1;
        this.updateAlertCanvas(alertContext, 5);
    }

    highlightServerToHire(discount) {
        for(let i=0; i<this.serverOnHand.length; i++){
            this.serverOnHandHighLight[i] = (this.money >= (discount + this.serverOnHand[i].serverCost)) ? 1 : 0;
        }
    }

    textCanvas(context, string, offsetX, offsetY, font) {
        if (font === undefined || font === null){
            context.font="20px verdana";
        } else {
            context.font=font;
        }
        context.shadowColor="white";
        context.shadowBlur=2;
        context.lineWidth=2;
        context.strokeStyle = "white";
        context.strokeText(string, offsetX, offsetY);
        context.shadowBlur=0;
        context.fillStyle="black";
        context.fillText(string, offsetX, offsetY);
    }

    triangleCanvas(context, X0, Y0, X1, Y1, X2, Y2){
        context.beginPath();
        context.moveTo(X0,Y0);
        context.lineTo(X1,Y1);
        context.lineTo(X2,Y2);
        context.fillStyle='black';
        context.fill();
        context.beginPath();
        context.moveTo(X0,Y0);
        context.lineTo(X1,Y1);
        context.lineTo(X2,Y2);
        context.lineTo(X0,Y0);
        context.strokeStyle='white';
        context.stroke();
    }

    markCanvas(context, X0, Y0, X1, Y1, X2, Y2){
        context.lineWidth = 5;
        context.beginPath();
        context.moveTo(X0, Y0);
        context.lineTo(X1, Y1);
        context.lineTo(X2, Y2);
        context.strokeStyle = 'green';
        context.stroke();
    }

    updateAlertCanvas(context, type){
        // clear canvas first
        context.clearRect(0, 0, 480, 240);
        // different types of alert
        switch(type){
            case 0: // take brown or white
            context.drawImage(moneyImg, 20, 100, 30, 30);
            this.textCanvas(context, "Boost", 60, 120);
            if(this.atActionBoost){ // draw a mark if boost is selected
                this.markCanvas(context, 80, 110, 90, 120, 100, 100);
            }
            context.drawImage(brownImg, 150, 100, 30, 30);
            this.textCanvas(context, game.players[game.currPlayer].atTakeBrown.toString(), 200, 120);
            this.triangleCanvas(context, 225, 110, 250, 90, 275, 110);
            this.triangleCanvas(context, 225, 120, 250, 140, 275, 120);
            context.drawImage(whiteImg, 300, 100, 30, 30);
            this.textCanvas(context, game.players[game.currPlayer].atTakeWhite.toString(), 350, 120);
            this.triangleCanvas(context, 375, 110, 400, 90, 425, 110);
            this.triangleCanvas(context, 375, 120, 400, 140, 425, 120);
            context.fillStyle = 'white';
            context.strokeStyle = 'black';
            context.strokeRect(200, 170, 100, 40);
            context.fillRect(200, 170, 100, 40);
            this.textCanvas(context, "确定", 228, 200);
            break;
            case 1: // take red or black
            context.drawImage(moneyImg, 20, 100, 30, 30);
            this.textCanvas(context, "Boost", 60, 120);
            if(this.atActionBoost){ // draw a mark if boost is selected
                this.markCanvas(context, 80, 110, 90, 120, 100, 100);
            }
            context.drawImage(redImg, 150, 100, 30, 30);
            this.textCanvas(context, game.players[game.currPlayer].atTakeRed.toString(), 200, 120);
            this.triangleCanvas(context, 225, 110, 250, 90, 275, 110);
            this.triangleCanvas(context, 225, 120, 250, 140, 275, 120);
            context.drawImage(blackImg, 300, 100, 30, 30);
            this.textCanvas(context, game.players[game.currPlayer].atTakeBlack.toString(), 350, 120);
            this.triangleCanvas(context, 375, 110, 400, 90, 425, 110);
            this.triangleCanvas(context, 375, 120, 400, 140, 425, 120);
            context.fillStyle = 'white';
            context.strokeStyle = 'black';
            context.strokeRect(200, 170, 100, 40);
            context.fillRect(200, 170, 100, 40);
            this.textCanvas(context, "确定", 228, 200);
            break;
            case 2: // prepare rooms
            context.drawImage(moneyImg, 20, 100, 30, 30);
            this.textCanvas(context, "Boost", 60, 120);
            if(this.atActionBoost){ // draw a mark if boost is selected
                this.markCanvas(context, 80, 110, 90, 120, 100, 100);
            }
            context.drawImage(roomRedPreparedImg, 140, 90, 50, 50);
            this.textCanvas(context, game.players[game.currPlayer].atRoomToPrepare.toString(), 200, 120);
            this.triangleCanvas(context, 225, 110, 250, 90, 275, 110);
            this.triangleCanvas(context, 225, 120, 250, 140, 275, 120);
            context.fillStyle = 'white';
            context.strokeStyle = 'black';
            context.strokeRect(200, 170, 100, 40);
            context.fillRect(200, 170, 100, 40);
            this.textCanvas(context, "确定", 228, 200);
            break;
            case 3: // take royal points or money
            context.drawImage(moneyImg, 20, 100, 30, 30);
            this.textCanvas(context, "Boost", 60, 120);
            if(this.atActionBoost){ // draw a mark if boost is selected
                this.markCanvas(context, 80, 110, 90, 120, 100, 100);
            }
            context.drawImage(royalTokenImg, 150, 95, 30, 40);
            this.textCanvas(context, game.players[game.currPlayer].atRoyal.toString(), 200, 120);
            this.triangleCanvas(context, 225, 110, 250, 90, 275, 110);
            this.triangleCanvas(context, 225, 120, 250, 140, 275, 120);
            context.drawImage(moneyImg, 300, 100, 30, 30);
            this.textCanvas(context, game.players[game.currPlayer].atMoney.toString(), 350, 120);
            this.triangleCanvas(context, 375, 110, 400, 90, 425, 110);
            this.triangleCanvas(context, 375, 120, 400, 140, 425, 120);
            context.fillStyle = 'white';
            context.strokeStyle = 'black';
            context.strokeRect(200, 170, 100, 40);
            context.fillRect(200, 170, 100, 40);
            this.textCanvas(context, "确定", 228, 200);
            break;
            case 4: // hire servers
            context.drawImage(moneyImg, 20, 100, 30, 30);
            this.textCanvas(context, "Boost", 60, 120);
            if(this.atActionBoost){ // draw a mark if boost is selected
                this.markCanvas(context, 80, 110, 90, 120, 100, 100);
            }
            context.drawImage(serverImg[0], 140, 90, 50, 50);
            context.fillStyle = 'white';
            context.strokeStyle = 'black';
            context.strokeRect(200, 170, 100, 40);
            context.fillRect(200, 170, 100, 40);
            this.textCanvas(context, "确定", 228, 200);
            break;
            case 5: // take mirrors
            var diceImg = dice1Img;
            switch(this.atMirrorDice){
                case 1: diceImg = dice1Img; break;
                case 2: diceImg = dice2Img; break;
                case 3: diceImg = dice3Img; break;
                case 4: diceImg = dice4Img; break;
                case 5: diceImg = dice5Img; break;
            }
            context.drawImage(diceImg, 150, 100, 30, 30);
            this.triangleCanvas(context, 225, 110, 250, 90, 275, 110);
            this.triangleCanvas(context, 225, 120, 250, 140, 275, 120);
            context.fillStyle = 'white';
            context.strokeStyle = 'black';
            context.strokeRect(200, 170, 100, 40);
            context.fillRect(200, 170, 100, 40);
            this.textCanvas(context, "确定", 228, 200);
            break;
        }
    }

    updateServerCanvas(context) {
        // clear canvas first
        context.clearRect(0, 0, 640, 560);

        // Server on hands
        this.textCanvas(context, "员工手牌", 25, 25);

        // draw the remaining of prev card if any
        var   serverXoffset = -105;
        var   serverYoffset = 35;
        const serverWidth = 160;
        const serverHeight = 240;
        if(this.serverOnHandCanvasIdx>0 && this.numServerOnHand>0) { 
            context.drawImage(serverImg[this.serverOnHand[this.serverOnHandCanvasIdx-1].serverID], serverXoffset, serverYoffset, serverWidth, serverHeight);
            // draw the left triangle to indicate
            this.triangleCanvas(context, 0, 105, 25, 130, 25, 80);
            // debug block
            context.strokeStyle = "red";
            context.lineWidth = 5;
            context.strokeRect(0, 80, 25, 50);
        }
        
        // draw 3 server cards if any
        for(let i=0; i<3; i++){
            if(this.serverOnHandCanvasIdx + i < this.numServerOnHand){
                serverXoffset+=170;
                context.drawImage(serverImg[this.serverOnHand[this.serverOnHandCanvasIdx+i].serverID], serverXoffset, serverYoffset, serverWidth, serverHeight);
                // hightlight block if needed
                if(this.serverOnHandHighLightFlag && this.serverOnHandHighLight[this.serverOnHandCanvasIdx+i]) {
                    context.strokeStyle = "red";
                    context.lineWidth = 5;
                    context.strokeRect(serverXoffset, serverYoffset, serverWidth, serverHeight);
                }
            }
        }

        // draw the remaining of next card if any
        if(this.serverOnHandCanvasIdx + 3 < this.numServerOnHand) {
            serverXoffset+=170;
            context.drawImage(serverImg[this.serverOnHand[this.serverOnHandCanvasIdx+3].serverID], serverXoffset, serverYoffset, serverWidth, serverHeight);
            // draw the right triangle to indicate
            this.triangleCanvas(context, 640, 105, 615, 130, 615, 80);
            // debug block
            context.strokeStyle = "red";
            context.lineWidth = 5;
            context.strokeRect(615, 80, 25, 50);
        }

        // Server hired
        this.textCanvas(context, "已雇佣员工", 25, 300);

        // draw the remaining of prev card if any
        serverXoffset = -105;
        serverYoffset += 275;
        // console.log("num server hired: " + this.numServerHired);
        if(this.serverHiredCanvasIdx>0 && this.numServerHired>0) { 
            context.drawImage(serverImg[this.serverHired[this.serverHiredCanvasIdx-1].serverID], serverXoffset, serverYoffset, serverWidth, serverHeight);
            // draw the left triangle to indicate
            this.triangleCanvas(context, 0, 380, 25, 405, 25, 355);
        }
        
        // draw 3 server cards if any
        for(let i=0; i<3; i++){
            if(this.serverHiredCanvasIdx + i < this.numServerHired){
                serverXoffset+=170;
                context.drawImage(serverImg[this.serverHired[this.serverHiredCanvasIdx+i].serverID], serverXoffset, serverYoffset, serverWidth, serverHeight);
            }
        }

        // draw the remaining of next card if any
        if(this.serverHiredCanvasIdx + 3 < this.numServerHired) {
            serverXoffset+=170;
            context.drawImage(serverImg[this.serverHired[this.serverHiredCanvasIdx+3].serverID], serverXoffset, serverYoffset, serverWidth, serverHeight);
            // draw the right triangle to indicate
            this.triangleCanvas(context, 640, 380, 615, 405, 615, 355);
        }
    }

    updatePlayerCanvas(context) {
        // clear canvas first
        context.clearRect(0, 0, 960, 50);

        // markers first
        const markerXoffset = 25;
        const markerYoffset = 25;
        const markerRadius = 10;
        context.fillStyle = this.markerColor;
        context.beginPath();
        context.arc(markerXoffset, markerYoffset, markerRadius, 0, 2 * Math.PI);
        context.fill();
        // draw the check mark if it's this player's turn
        if(this.turnFlag){
            this.markCanvas(context, 15, 20, 25, 30, 35, 10);
            context.strokeStyle = "green";
            context.lineWidth = 5;
            context.strokeRect(0, 0, 960, 50);
        }

        // player name
        const nameXoffset = 50;
        const nameYoffset = 30;
        this.textCanvas(context, this.playerName.substring(0, 16), nameXoffset, nameYoffset)

        // mini round status
        var   miniRoundXoffset = nameXoffset+100;
        var   miniRoundYoffset = 5;
        var   miniRoundWidth = 80;
        var   miniRoundHeight = 40;
        context.fillStyle = '#446516';
        context.strokeStyle = 'black';
        context.strokeRect(miniRoundXoffset, miniRoundYoffset, miniRoundWidth, miniRoundHeight);
        context.fillRect(miniRoundXoffset, miniRoundYoffset, miniRoundWidth, miniRoundHeight);
        
        var   miniRoundXoffset = nameXoffset+102;
        var   miniRoundYoffset = 8;
        var   miniRoundWidth = 34;
        var   miniRoundHeight = 34;
        if(this.diceTaken[0] != -1){ // draw the dice
            var diceImg = dice1Img;
            switch(this.diceTaken[0]){
                case 1: diceImg = dice1Img; break;
                case 2: diceImg = dice2Img; break;
                case 3: diceImg = dice3Img; break;
                case 4: diceImg = dice4Img; break;
                case 5: diceImg = dice5Img; break;
                case 6: diceImg = dice6Img; break;
            }
            context.drawImage(diceImg, miniRoundXoffset, miniRoundYoffset, miniRoundWidth, miniRoundHeight);
        } else { // draw the mini turn number
            context.fillStyle = '#446516';
            context.strokeStyle = 'black';
            context.lineWidth=2;
            context.strokeRect(miniRoundXoffset, miniRoundYoffset, miniRoundWidth, miniRoundHeight);
            context.fillRect(miniRoundXoffset, miniRoundYoffset, miniRoundWidth, miniRoundHeight);

            this.textCanvas(context, this.miniTurn[0], miniRoundXoffset+13, miniRoundYoffset+22);
        }

        var   miniRoundXoffset = nameXoffset+142;
        var   miniRoundYoffset = 8;
        var   miniRoundWidth = 34;
        var   miniRoundHeight = 34;
        if(this.diceTaken[0] != -1){ // draw the dice
            var diceImg = dice1Img;
            switch(this.diceTaken[1]){
                case 1: diceImg = dice1Img; break;
                case 2: diceImg = dice2Img; break;
                case 3: diceImg = dice3Img; break;
                case 4: diceImg = dice4Img; break;
                case 5: diceImg = dice5Img; break;
                case 6: diceImg = dice6Img; break;
            }
            context.drawImage(diceImg, miniRoundXoffset, miniRoundYoffset, miniRoundWidth, miniRoundHeight);
        } else { // draw the mini turn number
            context.fillStyle = '#446516';
            context.strokeStyle = 'black';
            context.lineWidth=2;
            context.strokeRect(miniRoundXoffset, miniRoundYoffset, miniRoundWidth, miniRoundHeight);
            context.fillRect(miniRoundXoffset, miniRoundYoffset, miniRoundWidth, miniRoundHeight);

            this.textCanvas(context, this.miniTurn[1], miniRoundXoffset+13, miniRoundYoffset+22);
        }

        // game point
        var   gamePointXoffset = miniRoundXoffset+50;
        var   gamePointYoffset = 5;
        const gamePointWidth = 30;
        const gamePointHeigh = 40;
        context.drawImage(gamePointTokenImg, gamePointXoffset, gamePointYoffset, gamePointWidth, gamePointHeigh);
        gamePointXoffset += 40;
        gamePointYoffset = 30;
        this.textCanvas(context, this.gamePoint, gamePointXoffset, gamePointYoffset);

        // royal point
        var   royalPointXoffset = gamePointXoffset+20;
        var   royalPointYoffset = 5;
        const royalPointWidth = 30;
        const royalPointHeigh = 40;
        context.drawImage(royalTokenImg, royalPointXoffset, royalPointYoffset, royalPointWidth, royalPointHeigh);
        royalPointXoffset += 40;
        royalPointYoffset = 30;
        this.textCanvas(context, this.royalPoint, royalPointXoffset, royalPointYoffset);

        // money
        var   moneyXoffset = royalPointXoffset+20;
        var   moneyYoffset = 5;
        const moneyWidth = 30;
        const moneyHeigh = 40;
        context.drawImage(moneyImg, moneyXoffset, moneyYoffset, moneyWidth, moneyHeigh);
        moneyXoffset += 40;
        moneyYoffset = 30;
        this.textCanvas(context, this.money, moneyXoffset, moneyYoffset);

        // kichen status
        // brown
        var   foodXoffset = moneyXoffset+30;
        var   foodYoffset = 5;
        const foodWidth = 30;
        const foodHeigh = 30;
        context.drawImage(brownImg, foodXoffset, foodYoffset, foodWidth, foodHeigh);
        foodXoffset += 40;
        foodYoffset = 30;
        this.textCanvas(context, this.brown, foodXoffset, foodYoffset);

        // white
        foodXoffset += 30;
        foodYoffset = 5;
        context.drawImage(whiteImg, foodXoffset, foodYoffset, foodWidth, foodHeigh);
        foodXoffset += 40;
        foodYoffset = 30;
        this.textCanvas(context, this.white, foodXoffset, foodYoffset);

        // red
        foodXoffset += 30;
        foodYoffset = 5;
        context.drawImage(redImg, foodXoffset, foodYoffset, foodWidth, foodHeigh);
        foodXoffset += 40;
        foodYoffset = 30;
        this.textCanvas(context, this.red, foodXoffset, foodYoffset);

        // black
        foodXoffset += 30;
        foodYoffset = 5;
        context.drawImage(blackImg, foodXoffset, foodYoffset, foodWidth, foodHeigh);
        foodXoffset += 40;
        foodYoffset = 30;
        this.textCanvas(context, this.black, foodXoffset, foodYoffset);

        // operation if it's this player's turn, including invite, action, serve, and checkout
        var   opXoffset = foodXoffset+30;
        var   opYoffset = 10;
        const opWidth = 40;
        const opHeigh = 20;
        if(this.turnFlag){
            if(this.opInvite){
                context.fillStyle = 'white';
            } else {
                context.fillStyle = 'grey';
            }
            context.strokeStyle = 'black';
            context.strokeRect(opXoffset, opYoffset, opWidth, opHeigh);
            context.fillRect(opXoffset, opYoffset, opWidth, opHeigh);
            context.font="15px Arial";
            context.fillStyle="black";
            context.fillText("邀请", opXoffset+6, opYoffset+15);

            opXoffset += 45;
            if(this.opAction){
                context.fillStyle = 'white';
            } else {
                context.fillStyle = 'grey';
            }
            context.strokeStyle = 'black';
            context.strokeRect(opXoffset, opYoffset, opWidth, opHeigh);
            context.fillRect(opXoffset, opYoffset, opWidth, opHeigh);
            context.font="15px Arial";
            context.fillStyle="black";
            context.fillText("取骰", opXoffset+6, opYoffset+15);

            opXoffset += 45;
            if(this.opServe){
                context.fillStyle = 'white';
            } else {
                context.fillStyle = 'grey';
            }
            context.strokeStyle = 'black';
            context.strokeRect(opXoffset, opYoffset, opWidth, opHeigh);
            context.fillRect(opXoffset, opYoffset, opWidth, opHeigh);
            context.font="15px Arial";
            context.fillStyle="black";
            context.fillText("上菜", opXoffset+6, opYoffset+15);

            opXoffset += 45;
            if(this.opCheckout){
                context.fillStyle = 'white';
            } else {
                context.fillStyle = 'grey';
            }
            context.strokeStyle = 'black';
            context.strokeRect(opXoffset, opYoffset, opWidth, opHeigh);
            context.fillRect(opXoffset, opYoffset, opWidth, opHeigh);
            context.font="15px Arial";
            context.fillStyle="black";
            context.fillText("结算", opXoffset+6, opYoffset+15);

            opXoffset += 45;
            if(this.opEnd){
                context.fillStyle = 'white';
            } else {
                context.fillStyle = 'grey';
            }
            context.strokeStyle = 'black';
            context.strokeRect(opXoffset, opYoffset, opWidth, opHeigh);
            context.fillRect(opXoffset, opYoffset, opWidth, opHeigh);
            context.font="15px Arial";
            context.fillStyle="black";
            context.fillText("结束", opXoffset+6, opYoffset+15);
        }
    }

    setMiniTurn(turn0, turn1) {
        this.miniTurn = [turn0, turn1];
    }

    setDiceTaken(turn, dice) {
        if(turn<0 || turn>1 || dice<1 || dice>6){ // mini turn can only be 0 or 1
            return;
        } else {
            this.diceTaken[turn] = dice;
        }
    }

    gainGamePoint(value) {
        this.gamePoint += value;
    }

    loseGamePoint(value) {
        this.gamePoint = Math.max(this.gamePoint-value, 0); // cannot below 0
    }

    getGamePoint() {
        return this.gamePoint;
    }

    gainRoyal(value) {
        if(this.royalPoint + value > 13){ // royal overflow to game point
            this.gamePoint += (this.royalPoint + value - 13);
        } else {
            this.royalPoint += value;
        }
    }

    loseRoyal(value) {
        this.royalPoint = Math.max(this.royalPoint-value, 0); // cannot below 0
    }

    getRoyalPoint() {
        return this.royalPoint;
    }

    gainBrown(value) {
        this.brown+=value;
        this.food+=value;
    }

    loseBrown() {
        this.brown--; // one at a time
        this.food--;
    }

    hasBrown() {
        return this.brown >= 0;
    }

    gainWhite(value) {
        this.white+=value;
        this.food+=value;
    }

    loseWhite() {
        this.white--; // one at a time
        this.food--;
    }

    hasWhite() {
        return this.white >= 0;
    }

    gainRed(value) {
        this.red+=value;
        this.food+=value;
    }

    loseRed() {
        this.red--; // one at a time
        this.food--;
    }

    hasRed() {
        return this.red >= 0;
    }

    gainBlack(value) {
        this.black+=value;
        this.food+=value;
    }

    loseBlack() {
        this.black--; // one at a time
        this.food--;
    }

    hasBlack() {
        return this.black >= 0;
    }

    clearKitchen() {
        this.brown = 0;
        this.white = 0;
        this.red = 0;
        this.black = 0;
        this.food = 0;
    }

    hasMoney(value) {
        return this.money >= value;
    }

    gainMoney(value) {
        this.money += value;
    }

    loseMoney(value) {
        this.money -= value;
    }

    addServerToHand(serverID) {
        this.numServerOnHand++;
        this.serverOnHand.push(new Server(serverID));
        this.serverOnHandHighLight.push(0);
    }

    checkServerAffordable(discount) {
        for(let i=0; i<this.serverOnHand.length; i++){
            this.serverOnHandHighLight[i] = (this.serverOnHandHighLight[i].serverCost <= (this.money+discount) ) ? 1 : 0;
        }
    }

    hireServer(serverIndex) {
        if(serverIndex >= this.serverOnHand.length){ // overflow
            return;
        }

        this.serverHired.push(this.serverOnHand[serverIndex]);
        this.numServerHired++;
        this.serverOnHand.splice(serverIndex, 1); // remove this server on hand
        this.serverOnHandHighLight.splice(serverIndex, 1);
        this.numServerOnHand--;
    }

    removeHiredServer(serverIndex) {
        if(serverIndex >= this.serverHired.length){ // overflow
            return;
        }

        this.serverHired.splice(serverIndex, 1); // remove this hired server
        this.numServerHired--;
    }

    hasHiredServer(serverID) {
        for(let i=0; i<this.serverHired.length; i++){
            if(this.serverHired[i].serverID == serverID){
                return true;
            }
        }
        return false;
    }
}