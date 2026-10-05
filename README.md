# UA Deck Lab — MVP

UNION ARENA 卡片搜尋、Deck Builder 與可解釋的卡組推薦原型。無後端或 API key，直接開啟 index.html 即可使用。

## 功能
- 搜尋卡名、編號、特徵與效果；依顏色、作品、能源、BP、卡種、特徵篩選及排序。
- 卡片詳細資訊、加入與移除卡片；單卡最多 4 張，牌組最多 50 張。
- 基本構築檢查、能源分布與平均能源。
- 核心卡搭配推薦：同作品、同色、共同特徵及效果方向，並考慮低能源缺口。
- 卡組草稿：低能源 18、中能源 12、高能源 20 張的啟發式目標，資料不足時顯示缺口。套用既有牌組前會確認。
- 瀏覽器 localStorage 儲存單一牌組。請在同一瀏覽器與來源使用。

## 資料與限制
現有 9 張示範卡並非官方完整資料，另有 15 張獨立標示的「原創測試組」卡片，可驗證 50 張草稿。沒有官方卡圖、第三方翻譯或網站爬取資料。正式資料需接入合法授權來源。

推薦是可解釋的規則評分，並非 AI 模型、勝率或實戰最佳牌組。基本檢查只涵蓋張數、單卡上限與作品，不涵蓋所有官方構築及禁限規則。收藏、缺卡分析與 AI Deck Builder 尚未實作。

## 架構
- index.html：既有介面、示範資料與核心卡搭配評分。
- deck-core.js：純函式組牌限制、基本驗證與推薦草稿邏輯。
- app-enhancements.js：篩選、牌組儲存、推薦與草稿介面。
- enhancements.css：擴充介面及手機版樣式。

## 測試
需 Node.js：

```sh
node deck-core.test.js
node --check app-enhancements.js
```

瀏覽器整合測試需安裝 Playwright 並有 Microsoft Edge：

    node browser.test.cjs

可設定 BROWSER_CHANNEL=chrome 使用 Chrome。測試涵蓋搜尋、篩選、卡片詳細、張數限制、重新整理儲存、草稿套用及手機寬度。
