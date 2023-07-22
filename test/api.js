const { search_album } = require("../src/api/search_album")

const chai = require("chai")
const expect = chai.expect
chai.use(require("chai-sorted"))

describe("api", () => {
  describe("search_album", () => {
    it("should return objects with correct types of values", function (done) {
      search_album("罗大佑")
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
      search_album("罗大佑")
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
      search_album("罗大佑")
        .then((res) => {
          expect(res).to.have.lengthOf.at.most(25)
          done()
        })
        .catch((err) => {
          done(err)
        })
    })

    it("should return empty array if no result", function (done) {
      search_album("锟斤拷锟斤拷烫烫烫烫烫烫")
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
