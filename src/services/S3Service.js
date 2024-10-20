const { S3Client, ListObjectsV2Command, PutObjectCommand, ObjectCannedACL, DeleteObjectCommand } = require("@aws-sdk/client-s3");

module.exports = class S3Service {
    #client;
    #bucket;
    constructor() {
        this.#bucket = process.env.BUCKET;
        this.#client = new S3Client({
            region: 'eu-west-3',
            credentials: {
                accessKeyId: process.env.ACCESS_KEY_ID,
                secretAccessKey: process.env.SECRET_ACCESS_KEY
            }
        });
    }

    /**
     * list one folder
     * @param {string} [path=''] path 
     * @returns {Promise<Array>}
     */
    async listFolder(path = '') {
        if(path !== '' && !path.endsWith('/')) return [];

        const command = new ListObjectsV2Command({
            Bucket: this.#bucket,
            Key: process.env.DIR_ROOT + path,
        });
        const result = await this.#client.send(command);

        let tab = [];
        result.Contents.forEach(elm => {
            if (
                elm.Key === process.env.DIR_ROOT + path ||
                elm.Key.endsWith('/') ||
                !(new RegExp(`^${process.env.DIR_ROOT + path}`)).test(elm.Key)
            ) {
                //....
            } else {
                tab.push(elm);
            }
        });

        return tab;
    }

    /**
     * 
     * @param {string|Buffer|Bob} file 
     * @param {string} path 
     * @param {string} ContentType
     * @returns {Promise<string>}
     */
    async addFile(file, path, ContentType) {
        //ContentType
        const command = new PutObjectCommand({
            "ACL": ObjectCannedACL.public_read,
            "Body": file,
            "Bucket": this.#bucket,
            "Key": process.env.DIR_ROOT + path,
            "ContentType": ContentType
        });
        await this.#client.send(command);
        
        return `https://${this.#bucket}.s3.amazonaws.com/${process.env.DIR_ROOT + path}`;
    }

    /**
     * @param {string} path 
     * @returns {Promise<void>}
     */
    async deleteFile(path) {
        const command = new DeleteObjectCommand({
            "Bucket": this.#bucket,
            "Key": process.env.DIR_ROOT + path,
        });
        await this.#client.send(command);
    }

    async emptyFolder(path) {
        const files = await this.listFolder(path);
        for(let entry of files) {
            await this.#client.send(new DeleteObjectCommand({
                "Bucket": this.#bucket,
                "Key": entry.Key,
            }));
        }
    }
}