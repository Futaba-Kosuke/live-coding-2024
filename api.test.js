import { assertEquals, assertArrayIncludes } from "https://deno.land/std@0.193.0/testing/asserts.ts";
import { afterEach, beforeEach, describe, it } from "https://deno.land/std@0.193.0/testing/bdd.ts";


Deno.test("1 + 1 は 2 である", () => {
  assertEquals(1 + 1, 2)
})

Deno.test("Hello World", () => {
  // Arrange
  const paragraph1 = "Hello";
  const paragraph2 = "World";

  // Act
  const result = concat(paragraph1, paragraph2);
  
  // Assert
  assertEquals(result, "Hello World");
})

const concat = (p1, p2) => {
  return `${p1} ${p2}`;
}

describe("Shiritori", () => {
  beforeEach(async () => {
    await (
      await fetch("http://localhost:8000/reset", {
        method: "POST"
      })
    ).body.cancel();
  })

  it("GET /shiritori", async () => {
    // Arrange: 準備
    
    // Act: 実行
    const result = await fetch("http://localhost:8000/shiritori", {method: "GET"});
    const previousWord = await result.text();

    // Assert: 確認
    assertArrayIncludes(["しりとり", "りんご", "ごりら", "らっぱ"], [previousWord]);
  });

  it("POST /shiritori", async () => {
    // Arrange
    const previousWord = await(await fetch("http://localhost:8000/shiritori", {method: "GET"})).text();

    // Act
    let nextWord;
    switch(previousWord) {
      case "しりとり": {
        nextWord = "りんご"
        break;
      }
      case "りんご": {
        nextWord = "ごりら"
        break;
      }
      case "ごりら": {
        nextWord = "らっぱ"
        break;
      }
      case "らっぱ": {
        nextWord = "ぱいなっぷる"
        break;
      }
    }
    const result = await fetch("http://localhost:8000/shiritori", {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({nextWord: nextWord})
    });
    const responseWord = await result.text();

    // Assert
    assertEquals(result.status, 200);
    assertEquals(responseWord, `${previousWord},${nextWord}`);
  })

  it("POST /shiritori: 前の単語に続いて居ない場合にエラーになることを確認", async () => {
    // Arrange
    const previousWord = await(await fetch("http://localhost:8000/shiritori", {method: "GET"})).text();

    // Act
    let nextWord;
    switch(previousWord) {
      case "しりとり": {
        nextWord = "なし"
        break;
      }
      case "りんご": {
        nextWord = "ぱいなっぷる"
        break;
      }
      case "ごりら": {
        nextWord = "りんご"
        break;
      }
      case "らっぱ": {
        nextWord = "どらごんふるーつ"
        break;
      }
    }
    const result = await fetch("http://localhost:8000/shiritori", {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({nextWord: nextWord})
    });
    const json = await result.json();

    // Assert
    assertEquals(result.status, 400);
    assertEquals(json["errorCode"], "10001");
  })

  it("POST /shiritori: 「ん」で終了することを確認", async () => {
    // Arrange
    const previousWord = await(await fetch("http://localhost:8000/shiritori", {method: "GET"})).text();

    // Act
    let nextWord;
    switch(previousWord) {
      case "しりとり": {
        nextWord = "りん"
        break;
      }
      case "りんご": {
        nextWord = "ごん"
        break;
      }
      case "ごりら": {
        nextWord = "らん"
        break;
      }
      case "らっぱ": {
        nextWord = "ぱん"
        break;
      }
    }
    const result = await fetch("http://localhost:8000/shiritori", {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({nextWord: nextWord})
    });
    const json = await result.json();

    // Assert
    assertEquals(result.status, 400);
    assertEquals(json["errorCode"], "10005");
  })

  it("POST /shiritori: 1文字の単語を入力した場合にエラーになることを確認", async () => {
    // Arrange
    const previousWord = await(await fetch("http://localhost:8000/shiritori", {method: "GET"})).text();

    // Act
    let nextWord;
    switch(previousWord) {
      case "しりとり": {
        nextWord = "り"
        break;
      }
      case "りんご": {
        nextWord = "ご"
        break;
      }
      case "ごりら": {
        nextWord = "ら"
        break;
      }
      case "らっぱ": {
        nextWord = "ぱ"
        break;
      }
    }
    const result = await fetch("http://localhost:8000/shiritori", {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({nextWord: nextWord})
    });
    const json = await result.json();

    // Assert
    assertEquals(result.status, 400);
    assertEquals(json["errorCode"], "10002");
  })
})
