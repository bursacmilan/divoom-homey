import Homey from 'homey';

class MyApp extends Homey.App {
    public onInit(): Promise<void> {
        this.log('MyApp has been initialized');
        return Promise.resolve();
    }
}

module.exports = MyApp;
