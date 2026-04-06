# 💸 Smart Expense Tracker

An intelligent, offline-first Android application designed to help users manage their finances seamlessly. This app goes beyond basic manual entry by integrating Optical Character Recognition (OCR) to extract data directly from physical receipts, providing a frictionless tracking experience. 

## ✨ Key Features

* **Smart OCR Receipt Scanning:** Instantly scan bills and receipts using device camera/gallery to automatically extract and log expense amounts.
* **Interactive Visualizations:** Beautiful, dynamic charts (Pie charts, Bar graphs) to analyze spending habits over time, powered by MPAndroidChart.
* **Offline-First Architecture:** All financial data is securely stored locally on the device using the Room Database, ensuring zero latency and total privacy.
* **Flexible Data Export:** Generate comprehensive expense reports by exporting data to both **PDF** and **Excel** formats for tax purposes or personal archiving.
* **Categorization & Filtering:** Easily categorize expenses (e.g., Food, Transport, Utilities) and filter historical data by date ranges.

## 🛠 Tech Stack & Libraries

* **Local Storage:** [Room Database](https://developer.android.com/training/data-storage/room) (SQLite abstraction)
* **Data Visualization:** [MPAndroidChart](https://github.com/PhilJay/MPAndroidChart)
* **Text Recognition (OCR):** Google ML Kit (Vision API) / Tesseract *(Update based on what you used)*
* **Exporting:** * PDF generation libraries (e.g., `iText` or Android's native `PdfDocument`)
  * Excel generation (e.g., `Apache POI`)
* **Architecture:** MVVM (Model-View-ViewModel) *(If applicable, otherwise adjust)*

## 🚀 Getting Started

### Prerequisites
* Android Studio (Latest version recommended)
* Minimum SDK: API 24 (Android 7.0) *(Update based on your build.gradle)*

### Installation
1. Clone the repository:
   ```bash
   git clone [https://github.com/your-username/smart-expense-tracker.git](https://github.com/your-username/smart-expense-tracker.git)
