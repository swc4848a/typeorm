import "reflect-metadata";
import {expect} from "chai";
import {setupSingleTestingConnection} from "../../utils/test-utils";
import {ConnectionOptions} from "../../../src/connection/ConnectionOptions";
import {ConnectionManager} from "../../../src/connection/ConnectionManager";
import {MysqlDriver} from "../../../src/driver/mysql/MysqlDriver";
import {PrimaryGeneratedColumn} from "../../../src/decorator/columns/PrimaryGeneratedColumn";
import {Column} from "../../../src/decorator/columns/Column";
import {Entity} from "../../../src/decorator/entity/Entity";

describe("ConnectionManager", () => {

    @Entity()
    class Post {

        @PrimaryGeneratedColumn()
        id: number;

        @Column()
        title: string;

        constructor(id: number, title: string) {
            this.id = id;
            this.title = title;
        }
    }

    describe("create", function() {

        it("should create a mysql connection when mysql driver is specified", () => {

            const options: ConnectionOptions = setupSingleTestingConnection("mysql", {
                name: "default",
                entities: []
            });
            const connectionManager = new ConnectionManager();
            const connection = connectionManager.create(options);
            connection.name.should.be.equal("default");
            connection.driver.should.be.instanceOf(MysqlDriver);
            connection.isConnected.should.be.false;
        });

       /* it("should create a postgres connection when postgres driver is specified", () => {
            const options: ConnectionOptions = {
                name: "myPostgresConnection",
                driver: createTestingConnectionOptions("postgres")
            };
            const connectionManager = new ConnectionManager();
            const connection = connectionManager.create(options);
            connection.name.should.be.equal("myPostgresConnection");
            connection.driver.should.be.instanceOf(PostgresDriver);
            connection.isConnected.should.be.false;
        });*/

    });

    /*describe("createAndConnect", function() {

        it("should create a mysql connection when mysql driver is specified AND connect to it", async () => {
            const options: ConnectionOptions = setupSingleTestingConnection("mysql", {
                name: "default",
                entities: []
            });
            const connectionManager = new ConnectionManager();
            const connection = await connectionManager.createAndConnect(options);
            connection.name.should.be.equal("default");
            connection.driver.should.be.instanceOf(MysqlDriver);
            connection.isConnected.should.be.true;
            await connection.close();
        });

    /!*    it("should create a postgres connection when postgres driver is specified AND connect to it", async () => {
            const options: ConnectionOptions = {
                name: "myPostgresConnection",
                driver: createTestingConnectionOptions("postgres")
            };
            const connectionManager = new ConnectionManager();
            const connection = await connectionManager.createAndConnect(options);
            connection.name.should.be.equal("myPostgresConnection");
            connection.driver.should.be.instanceOf(PostgresDriver);
            connection.isConnected.should.be.true;
            await connection.close();
        });*!/

    });*/

    describe("get", function() {

        it("should give connection with a requested name", () => {
            const options: ConnectionOptions = setupSingleTestingConnection("mysql", {
                name: "myMysqlConnection",
                entities: []
            });
            const connectionManager = new ConnectionManager();
            const connection = connectionManager.create(options);
            connection.driver.should.be.instanceOf(MysqlDriver);
            connectionManager.get("myMysqlConnection").should.be.equal(connection);
        });

        it("should throw an error if connection with the given name was not found", () => {
            const options: ConnectionOptions = setupSingleTestingConnection("mysql", {
                name: "myMysqlConnection",
                entities: []
            });
            const connectionManager = new ConnectionManager();
            const connection = connectionManager.create(options);
            connection.driver.should.be.instanceOf(MysqlDriver);
            expect(() => connectionManager.get("myPostgresConnection")).to.throw(Error);
        });

    });

    describe("create connection options", function() {

        it("should not drop the database if dropSchemaOnConnection was not specified", async () => {
            const options: ConnectionOptions = setupSingleTestingConnection("mysql", {
                name: "myMysqlConnection",
                schemaCreate: true,
                entities: [Post]
            });
            const connectionManager = new ConnectionManager();

            // create connection, save post and close connection
            let connection = await connectionManager.create(options).connect();
            const post = new Post(1, "Hello post");
            await connection.manager.save(post);
            await connection.close();

            // recreate connection and find previously saved post
            connection = await connectionManager.create(options).connect();
            const loadedPost = (await connection.manager.findOneById(Post, 1))!;
            loadedPost.should.be.instanceof(Post);
            loadedPost.should.be.eql({ id: 1, title: "Hello post" });
            await connection.close();
        });

        it("should drop the database if dropSchemaOnConnection was set to true (mysql)", async () => {
            const options: ConnectionOptions = setupSingleTestingConnection("mysql", {
                name: "myMysqlConnection",
                schemaCreate: true,
                dropSchemaOnConnection: true,
                entities: [Post]
            });
            const connectionManager = new ConnectionManager();

            // create connection, save post and close connection
            let connection = await connectionManager.create(options).connect();
            const post = new Post(1, "Hello post");
            await connection.manager.save(post);
            await connection.close();

            // recreate connection and find previously saved post
            connection = await connectionManager.create(options).connect();
            const loadedPost = await connection.manager.findOneById(Post, 1);
            expect(loadedPost).to.be.undefined;
            await connection.close();
         });

     /*   it("should drop the database if dropSchemaOnConnection was set to true (postgres)", async () => {
            const options: ConnectionOptions = {
                dropSchemaOnConnection: true,
                autoSchemaSync: true,
                driver: createTestingConnectionOptions("postgres"),
                entities: [Post]
            };
            const connectionManager = new ConnectionManager();

            // create connection, save post and close connection
            let connection = await connectionManager.createAndConnect(options);
            const post = new Post(1, "Hello post");
            await connection.manager.persist(post);
            await connection.close();

            // recreate connection and find previously saved post
            connection = await connectionManager.createAndConnect(options);
            const loadedPost = await connection.manager.findOneById(Post, 1);
            expect(loadedPost).to.be.undefined;

            await connection.close();
         });*/

    /*    it("should drop the database if dropSchemaOnConnection was set to true (postgres)", async () => {
            const options: ConnectionOptions = {
                dropSchemaOnConnection: true,
                autoSchemaSync: true,
                driver: createTestingConnectionOptions("postgres"),
                entities: [Post]
            };
            const connectionManager = new ConnectionManager();

            // create connection, save post and close connection
            let connection = await connectionManager.createAndConnect(options);
            const post = new Post(1, "Hello post");
            await connection.manager.persist(post);
            await connection.close();

            // recreate connection and find previously saved post
            connection = await connectionManager.createAndConnect(options);
            const loadedPost = await connection.manager.findOneById(Post, 1);
            expect(loadedPost).to.be.undefined;
            await connection.close();
         });*/

    });

});
