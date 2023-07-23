const chai = require("chai")
const expect = chai.expect
chai.use(require("chai-sorted"))

const { search_album } = require("../src/api/search_album")
const { get_album_songs } = require("../src/api/get_album_songs")
const { get_raw_lyric_by_id } = require("../src/api/get_raw_lyric_by_id")
const { get_song_url_by_id } = require("../src/api/get_song_url_by_id")

// input parameters used for testing
const VALID_ALBUM_SEARCH_PARAM = "罗大佑"
const INVALID_ALBUM_SEARCH_PARAM = "锟斤拷锟斤拷烫烫烫烫烫烫"
const VALID_SONG_ID = 370380 // 风透的日子
const VALID_ALBUM_ITEM = {
  name: "宝岛咸酸甜",
  id: 36710,
  size: 10,
  pic: "https://placeholder.jpg",
  date: 823104000000,
  ar: "OK男女合唱团",
}

describe("api", () => {
  describe("search_album", () => {
    it("should return objects with correct types of values", function (done) {
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

    it("should return results sorted by date", function (done) {
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

    it("should return at most 25 results", function (done) {
      search_album(VALID_ALBUM_SEARCH_PARAM)
        .then((res) => {
          expect(res).to.have.lengthOf.at.most(25)
          done()
        })
        .catch((err) => {
          done(err)
        })
    })

    it("should return empty array if no result", function (done) {
      search_album(INVALID_ALBUM_SEARCH_PARAM)
        .then((res) => {
          expect(res).to.be.an("array").that.is.empty
          done()
        })
        .catch((err) => {
          done(err)
        })
    })
  })

  describe("get_album_songs", () => {
    it("should return objects with correct types of values", function (done) {
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
  })

  describe("get_raw_lyric_by_id", () => {
    it("should return the unparsed lyric as a string", function (done) {
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
    it("should return a valid url and a status code", function (done) {
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
})
