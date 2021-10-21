import petitio from "petitio";
class waifuPicsApi {
    public baseURI = "https://api.waifu.pics";

    public reactionImage(tag: string, nsfw?: boolean) {
        return petitio(`${this.baseURI}/${nsfw ? "nsfw" : "sfw"}/${tag}`).json();
    }
}

export default new waifuPicsApi();
