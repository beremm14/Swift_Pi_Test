import { Server } from './server';

class Main {

    public static main () {
        const server = new Server(8080);
        server.start();
    }
}

Main.main();
