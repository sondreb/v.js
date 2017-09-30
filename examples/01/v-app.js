
export class MyApp {

    constructor() {

    }

    async onDetailsOpened() {
        console.log('onDetailsOpened!!!');
    }

    async onStarted() {
        console.log('onStarted from app module!');
    }

    async onStart() {
        console.log('onStart from app module!');
    }

    async onAlert()
    {
        console.log('onAlert was called on MyApp!');
    }

}