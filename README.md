# Ứng dụng Trắc nghiệm React + Firebase

## Tính năng
- Tạo và quản lý bộ đề trắc nghiệm
- Làm bài thi với tính năng trộn câu hỏi và đáp án
- Lưu trữ dữ liệu trên Firebase Firestore
- Hiển thị kết quả chi tiết sau khi làm bài

## Cài đặt

1. Cài đặt dependencies:
```bash
npm install
```

2. Cấu hình Firebase:
- Tạo project Firebase tại https://console.firebase.google.com
- Tạo Firestore database
- Sao chép config và thay thế trong `src/firebase.js`

3. Chạy ứng dụng:
```bash
npm start
```

## Cấu trúc dữ liệu Firestore

Collection: `quizSets`
```json
{
  "title": "Tên bộ đề",
  "questions": [
    {
      "question": "Câu hỏi",
      "options": ["Đáp án A", "Đáp án B", "Đáp án C", "Đáp án D"],
      "correctAnswer": 0
    }
  ],
  "createdAt": "timestamp"
}
```

## Sử dụng
1. Truy cập trang chủ để xem danh sách bộ đề
2. Nhấn "Tạo bộ đề" để tạo bộ đề mới
3. Nhấn "Import Excel" để tạo bộ đề từ file Excel
4. Nhấn "Làm bài" để bắt đầu làm bài thi
5. Sử dụng tùy chọn trộn câu hỏi/đáp án trước khi làm bài

## Định dạng file Excel
File Excel cần có cấu trúc:
- Cột A: Câu hỏi
- Cột B: Đáp án A
- Cột C: Đáp án B  
- Cột D: Đáp án C
- Cột E: Đáp án D
- Cột F: Số thứ tự đáp án đúng (1-4)

Dòng đầu tiên là tiêu đề, dữ liệu bắt đầu từ dòng 2.