const chai = require("chai")
const sinon = require("sinon")
const proxyquire = require('proxyquire');
const expect = chai.expect
chai.use(require("chai-sorted"))
chai.use(require('chai-as-promised'));

const NeteaseCloudMusicApi = require("NeteaseCloudMusicApi")
const { search_album } = require("../src/api/search_album")
const { get_album_songs } = require("../src/api/get_album_songs")
const { get_raw_lyric_by_id } = require("../src/api/get_raw_lyric_by_id")
const { get_song_url_by_id } = require("../src/api/get_song_url_by_id")
const { get_user_profile } = require("../src/api/get_user_profile")
const { get_user_playlist } = require("../src/api/get_user_playlist")
const {
  get_songs_from_playlist,
} = require("../src/api/get_songs_from_playlist")
const { ERR_SERVER_ERROR } = require("../src/common")

// input parameters used for testing
const VALID_ALBUM_SEARCH_PARAM = "罗大佑"
const VALID_ALBUM_SEARCH_PARAM_2 = "冀西南林路行"
const VALID_SONG_ID = 370380 // 风透的日子
const VALID_USERNAME = "麻辣烤鱼别放大葱"
const VALID_USERID = 258270965
const VALID_USERID_NO_PLAYLIST = 123123123
const VALID_PLAYLIST_ID = 2173922287
const EMPTY_PLAYLIST_ID = 2299457210
const INVALID_SEARCH_PARAM = "平父燈車說只幸已西"
const VALID_ALBUM_ITEM = {
  name: "宝岛咸酸甜",
  id: 36710,
  size: 10,
  pic: "https://placeholder.jpg",
  date: 823104000000,
  ar: "OK男女合唱团",
}
const ERR_RESPONSE = {
  status: ERR_SERVER_ERROR,
  body: {
    code: ERR_SERVER_ERROR,
  }
}

describe("api", () => {
  describe("search_album", () => {
    it("should return objects with correct types of values", (done) => {
      search_album(VALID_ALBUM_SEARCH_PARAM)
        .then((res) => {
          expect(res).to.be.an("array")

          res.forEach((item) => {
            expect(item).to.be.an("object")
            expect(item).to.have.all.keys(
              "name",
              "id",
              "size",
              "pic",
              "date",
              "ar"
            )
            expect(item.name).to.be.a("string")
            expect(item.id).to.be.a("number")
            expect(item.size).to.be.a("number")
            expect(item.pic).to.be.a("string")
            expect(item.date).to.be.a("number")
            expect(item.ar).to.be.a("string")

            expect(item.id).to.satisfy((num) => {
              return Number.isInteger(num) && num >= 0
            })

            expect(item.size).to.satisfy((num) => {
              return Number.isInteger(num) && num > 0
            })

            expect(item.pic).to.satisfy((string) => {
              return /^https?:\/\/[^ "]+\.(jpg|png|jpeg|gif)$/.test(string)
            })

            expect(item.date).to.satisfy((num) => {
              let date = new Date(num)
              return !isNaN(date.getTime())
            })
          })

          done()
        })
        .catch((err) => {
          done(err)
        })
    })

    it("should return results sorted by date", (done) => {
      search_album(VALID_ALBUM_SEARCH_PARAM)
        .then((res) => {
          const dates = res.map((item) => item.date)
          expect(dates).to.be.sorted({ descending: true })
          done()
        })
        .catch((err) => {
          done(err)
        })
    })

    it("should return at most 25 results", (done) => {
      search_album(VALID_ALBUM_SEARCH_PARAM)
        .then((res) => {
          expect(res).to.have.lengthOf.at.most(25)
        })
        .catch((err) => {
          done(err)
        })
      search_album(VALID_ALBUM_SEARCH_PARAM_2)
        .then((res) => {
          expect(res).to.have.lengthOf.at.most(25)
          done()
        })
        .catch((err) => {
          done(err)
        })
    })

    it("should return empty array if no result", (done) => {
      search_album(INVALID_SEARCH_PARAM)
        .then((res) => {
          expect(res).to.be.an("array").that.is.empty
          done()
        })
        .catch((err) => {
          done(err)
        })
    })

    it('should throw if api returns error', async () => {
      let cloudsearch_stub = sinon.stub();
      const proxy_api = { ...NeteaseCloudMusicApi, cloudsearch: cloudsearch_stub };

      let search_album = proxyquire("../src/api/search_album", {
        "NeteaseCloudMusicApi": proxy_api
      }).search_album;

      cloudsearch_stub.resolves(ERR_RESPONSE);

      await expect(search_album(VALID_ALBUM_SEARCH_PARAM))
      .to.be.rejected.then((error) => {
        expect(error).to.be.a('string');
        expect(error).to.include(500);
      });

      cloudsearch_stub.reset();
    });
  })

  describe("get_album_songs", () => {
    it("should return objects with correct types of values", (done) => {
      get_album_songs(VALID_ALBUM_ITEM)
        .then((res) => {
          expect(res).to.be.an("array")

          res.forEach((item) => {
            expect(item).to.be.an("object")
            expect(item).to.have.all.keys("name", "id", "ar", "al", "source")

            expect(item.name).to.be.a("string")
            expect(item.id).to.be.a("number")
            expect(item.source).to.be.a("string")
            ;["ar", "al"].forEach((key) => {
              expect(item[key])
                .to.be.an("object")
                .that.has.all.keys("name", "id")
              expect(item[key].name).to.be.a("string")
              expect(item[key].id).to.be.a("number")
            })
          })

          done()
        })
        .catch((err) => {
          done(err)
        })
    })

    it('should throw if api returns error', async () => {
      let album_stub = sinon.stub();
      const proxy_api = { ...NeteaseCloudMusicApi, album: album_stub };

      let get_album_songs = proxyquire("../src/api/get_album_songs", {
        "NeteaseCloudMusicApi": proxy_api
      }).get_album_songs;

      album_stub.resolves(ERR_RESPONSE);

      await expect(get_album_songs(VALID_ALBUM_ITEM))
      .to.be.rejected.then((error) => {
        expect(error).to.be.a('string');
        expect(error).to.include(500);
      });

      album_stub.reset();
    });
  })

  describe("get_raw_lyric_by_id", () => {
    it("should return the unparsed lyric as a string", (done) => {
      get_raw_lyric_by_id(VALID_SONG_ID)
        .then((res) => {
          expect(res).to.be.a("string")

          done()
        })
        .catch((err) => {
          done(err)
        })
    })
  })

  describe("get_song_url_by_id", () => {
    it("should return a valid url and a status code", (done) => {
      get_song_url_by_id(VALID_SONG_ID)
        .then((res) => {
          expect(res).to.be.an("array")
          expect(res).to.have.lengthOf(2)

          const [url, code] = res
          expect(url).to.be.a("string")
          expect(code).to.be.a("number")
          expect(url).to.match(/^http(s)?:\/\/.*/)

          done()
        })
        .catch((err) => {
          done(err)
        })
    })
  })

  describe("get_user_profile", () => {
    it("should return the correct user profile", (done) => {
      get_user_profile(VALID_USERNAME)
        .then((res) => {
          expect(res).to.be.an("object")
          expect(res).to.include.keys(
            "nickname",
            "playlistCount",
            "signature",
            "userId"
          )
          expect(res.nickname).to.be.a("string")
          expect(res.playlistCount).to.be.a("number")
          expect(res.signature).to.be.a("string")
          expect(res.userId).to.be.a("number")

          done()
        })
        .catch((err) => {
          done(err)
        })
    })

    it("should return null if no user found", (done) => {
      get_user_profile(INVALID_SEARCH_PARAM)
        .then((res) => {
          expect(res).to.be.null

          done()
        })
        .catch((err) => {
          done(err)
        })
    })
  })

  describe("get_user_playlist", () => {
    it("should return an array of playlist objects", (done) => {
      get_user_playlist(VALID_USERID)
        .then((res) => {
          expect(res).to.be.an("array")

          res.forEach((item) => {
            expect(item).to.be.an("object")

            expect(item).to.have.all.keys(
              "name",
              "id",
              "play_count",
              "count",
              "cover_img"
            )
            expect(item.name).to.be.a("string")
            expect(item.id).to.be.a("number")
            expect(item.play_count).to.be.a("number")
            expect(item.count).to.be.a("number")
            expect(item.cover_img).to.be.a("string")
          })

          done()
        })
        .catch((err) => {
          done(err)
        })
    })

    it("should return empty array if no playlist found", (done) => {
      get_user_playlist(VALID_USERID_NO_PLAYLIST)
        .then((res) => {
          expect(res).to.be.an("array").that.is.empty

          done()
        })
        .catch((err) => {
          done(err)
        })
    })
  })

  describe("get_songs_from_playlist", () => {
    it("should return the valid playlist songs", (done) => {
      get_songs_from_playlist({ id: VALID_PLAYLIST_ID })
        .then((res) => {
          expect(res).to.be.an("array")

          res.forEach((item) => {
            expect(item).to.be.an("object")
            expect(item).to.have.all.keys("name", "id", "ar", "al", "source")
            expect(item.name).to.be.a("string")
            expect(item.id).to.be.a("number")
            expect(item.source).to.be.a("string")
          })

          done()
        })
        .catch((err) => {
          done(err)
        })
    })

    it("should return empty array if playlist is empty", (done) => {
      get_songs_from_playlist({ id: EMPTY_PLAYLIST_ID })
        .then((res) => {
          expect(res).to.be.an("array").that.is.empty

          done()
        })
        .catch((err) => {
          done(err)
        })
    })
  })
})
