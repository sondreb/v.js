
export class MyApp {

    constructor() {

    }

    async onDetailsOpened() {
        console.log('onDetailsOpened!!!');
    }

    async onWelcomeOpened() {
        console.log('onDetailsOpened!!!');
    }

    async onStarted(v) {
        console.log('onStarted from app module!');

        // Make the loading screen appear for a second. This is normally not needed, just for sample demo:
        setTimeout(() => {
            v.hide('loading');
        }, 1000);
    }

    async onStart() {
        console.log('onStart from app module!');
    }

    async onAlert() {
        console.log('onAlert was called on MyApp!');
    }

}