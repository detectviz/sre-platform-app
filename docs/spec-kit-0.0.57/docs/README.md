# 文檔

此資料夾包含 Spec Kit 的文檔來源檔案，使用 [DocFX](https://dotnet.github.io/docfx/) 建置。

## 本地建置

若要在本地建置文檔：

1. 安裝 DocFX：
   ```bash
   dotnet tool install -g docfx
   ```

2. 建置文檔：
   ```bash
   cd docs
   docfx docfx.json --serve
   ```

3. 在瀏覽器中開啟 `http://localhost:8080` 來檢視文檔。

## 結構

- `docfx.json` - DocFX 設定檔案
- `index.md` - 主要文檔首頁
- `toc.yml` - 目錄設定
- `installation.md` - 安裝指南
- `quickstart.md` - 快速入門指南
- `_site/` - 產生的文檔輸出（被 git 忽略）

## 部署

當變更推送至 `main` 分支時，文檔會自動建置並部署至 GitHub Pages。工作流程定義在 `.github/workflows/docs.yml` 中。
