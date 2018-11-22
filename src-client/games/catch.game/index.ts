import { BaseGame, hitTestRectangle, loaderHandler, generateContainer } from "../base.game";
import { Graphics, Text, Texture, Sprite, loader } from "pixi.js";
import { SuperMan, SuperManDirection } from './super-man';
import { FallItem } from './fall-item';
import * as moment from 'moment';

// import * as dat from "dat.gui";
// const gui = new dat.GUI();

export class CatchGame extends BaseGame {
    private superMan: SuperMan = null; // 超人
    private fallItems: FallItem[] = []; // 掉落物陣列
    private fallItemsContainer: PIXI.Container = null;
    private gameTime: number = 30; // 遊戲時間
    private timeText: Text = null; // 時間顯示文字
    private now: moment.Moment = moment(); // 計算時間用


    protected async initImages(): Promise<void> {
        await loaderHandler('bg', '/static/images/bg.catch.jpg');
        await loaderHandler('win', '/static/images/img-win.png');
        await loaderHandler('wow', '/static/images/img-wow.png');
        await loaderHandler('coin', '/static/images/item-coin.png');
        await loaderHandler('point', '/static/images/item-point.png');

        this.setBackground();  // 放上背景
    } 

    protected async initElements(): Promise<boolean> {
        // 建立掉落物用的容器
        this.fallItemsContainer = generateContainer(this.application.screen.width, this.application.screen.height);
        this.stage.addChild(this.fallItemsContainer);
        // 建立超人
        this.superMan = await new SuperMan(this.application).init();
        this.stage.addChild(this.superMan.sprite);
        // 建立計時器
        await this.setGameTime();    

        return Promise.resolve(true);
    }
    protected initElementsOffset(): Promise<boolean> {
        return Promise.resolve(true);
    }
    protected initElementsEvents(): Promise<boolean> {
        // 點擊畫面開始遊戲
        document.addEventListener('pointerdown', this.play.bind(this));
        

        return Promise.resolve(true);
    }

    private async setGameTime() {
        // 初始化計時文字
        this.timeText = await this.generateText('/static/images/item-time.png', 2, 87, 28, 15);
        this.handleGameTimeText(); 
    }

    private async generateFallItemHandler(): Promise<void> {
        const posArr = [0, 0, 0 ,0, 0];
        // 每次產生 0~3 個掉落物
        const generateItems = Math.floor(Math.random() * 3) + 1;
        for (let i = 0; i < generateItems; i++) {
            let index = Math.floor(Math.random() * 5);
            while(posArr[index] === 1) {
                index = Math.floor(Math.random() * 5);
            }
            posArr[index] = 1;

            if ((Math.ceil((Math.random() * 1000)) % 2) === 1) {
                const fallitem = await new FallItem(this.application).init(index);
                this.fallItems.push(fallitem);
                this.fallItemsContainer.addChild(fallitem.sprite)
            }
        }

    }

    private checkGameTime() {
        if(this.gameTime <= 0) this.end();
    }

    private checkHitItem() {
        this.fallItems.filter(item => hitTestRectangle(this.superMan.sprite, item.sprite)).forEach(item => {
            // 檢查掉落物與超人是否碰撞，是 -> 隱藏+移除
            item.sprite.visible = false
            item.sprite.removeChild(item.sprite);

            // 增加點數 & 金幣
            const { x, y } = this.superMan.sprite;
            // 有獲得點數才有機會獲得硬幣
            const coin = item.point > 0 ? Math.floor(Math.random() * 3) : 0;

            this.addPoint(item.point);
            this.addCoins(coin);
            this.handleEffect(x, y, item.point, coin);
        })
        this.fallItems.filter(item => item.sprite.y > this.application.screen.height).forEach(item => {
            // 檢查掉落物是否掉出畫面了，是 -> 隱藏+移除
            item.sprite.visible = false
            item.sprite.removeChild(item.sprite);
        })

        this.fallItems = this.fallItems.filter(item => item.sprite.visible)
    }

    private handleGameTimeText() {
        // 顯示遊戲時間
        const mm: string = moment("1970-01-01T00:00").add(this.gameTime, "seconds").format("mm");
        const ss: string = moment("1970-01-01T00:00").add(this.gameTime, "seconds").format("ss");
        this.timeText.text = `${mm}:${ss}`;
    }

    private processing() {
        // 處理進行中遊戲
        this.checkGameTime();
        this.checkHitItem();
        this.handleGameTimeText();

        if(Math.abs(this.now.diff(moment())) >= 1000) {
            // 每秒建立一次掉落物品
            this.generateFallItemHandler()
            this.gameTime -= 1; // 減少時間秒數
            this.handleGameTimeText(); 
            this.now = moment();
        }
    }

    play() {
        if (this.isPlaying || this.isGameEnd) return;

        this.isPlaying = true;
        this.now = moment();
        document.removeEventListener('pointerdown', this.play.bind(this));

        document.addEventListener('pointerdown', (e) => {
            // 點擊畫面事件
            console.log('[pointerdown]', e)
            this.superMan.turnDirection();
        });
        this.superMan.start(); // 超人開始移動
        this.generateFallItemHandler(); // 建立第一批掉落物
        this.application.ticker.add(this.processing, this); // 開始處理遊戲

    }

    end() {
        this.isGameEnd = true;
        this.superMan.end();
        this.application.ticker.remove(this.processing, this);
        this.fallItems.forEach(item => {
            item.sprite.visible = false;
            item.sprite.removeChild(item.sprite);
        });
    }
}