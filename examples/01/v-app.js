
export class MyApp {

    constructor() {

    }

    /** Handler defined with async keyword */
    async onDetailsOpened(v) {
        console.log('onDetailsOpened!!!');

        // Opened events can return data that will be binded in the view.
        return { profile: { nickname: 'Fill out and save!' } };
    }

    /** Handler example without async keyword */
    onWelcomeOpened(v) {
        console.log('onDetailsOpened!!!');

        return {
            options: {
                list: [{ value: 1, label: 'Option 1' }, { value: 2, label: 'Option 2' }, { value: 3, label: 'Option 3' }]
            }
        };
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

    async onSave(v, e, s, d) {
        console.log('v.js:', v);
        console.log('event:', e);
        console.log('source:', s);
        console.log('data:', d);

        v.el('details-nickname').innerText = 'You filled out: ' + d.profile.nickname;
    }

    onSaveList(v, e, s, d) {
        console.log('v.js:', v);
        console.log('event:', e);
        console.log('source:', s);
        console.log('data:', d);

        v.el('list-value').innerText = 'You selected: ' + d.options.list;
    }

}