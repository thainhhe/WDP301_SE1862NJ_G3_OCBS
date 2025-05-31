// Định nghĩa ánh xạ cho branch và theater
const branchMapping = {
  branch_01: ObjectId("6837e76a9b8c8c3c76374787"),
  branch_02: ObjectId("6837e8649b8c8c3c7637478a"),
};

const theaterMapping = {
  theater_b01_t01: ObjectId("6837e76a9b8c8c3c76374788"),
  theater_b01_t02: ObjectId("6837e76a9b8c8c3c76374789"),
  theater_b02_t01: ObjectId("6837e8649b8c8c3c7637478b"),
};

// Lưu trữ ánh xạ từ _id cũ sang _id mới (ObjectId)
const seatIdMapping = {};

// Lần duyệt đầu tiên: Tạo ObjectId mới cho mỗi ghế và lưu ánh xạ
db.seats.find().forEach(function (doc) {
  const newId = ObjectId();
  seatIdMapping[doc._id] = newId;
});

// Lần duyệt thứ hai: Cập nhật tài liệu với _id mới, branch, theater và adjacentSeats
db.seats.find().forEach(function (doc) {
  // Tạo danh sách adjacentSeats mới với ObjectId
  const newAdjacentSeats = doc.adjacentSeats.map(function (seatId) {
    return seatIdMapping[seatId] || seatId; // Sử dụng ObjectId mới nếu tồn tại
  });

  // Cập nhật tài liệu
  db.seats.updateOne(
    { _id: doc._id },
    {
      $set: {
        _id: seatIdMapping[doc._id], // _id mới
        branch: branchMapping[doc.branch], // branch mới
        theater: theaterMapping[doc.theater], // theater mới
        adjacentSeats: newAdjacentSeats, // adjacentSeats mới
        updatedAt: new Date(), // Cập nhật thời gian
      },
    }
  );

  // Xóa tài liệu cũ và chèn tài liệu mới với _id mới
  db.seats.insertOne({
    _id: seatIdMapping[doc._id],
    theater: theaterMapping[doc.theater],
    branch: branchMapping[doc.branch],
    row: doc.row,
    number: doc.number,
    type: doc.type,
    isActive: doc.isActive,
    position: doc.position,
    adjacentSeats: newAdjacentSeats,
    createdAt: doc.createdAt,
    updatedAt: new Date(),
  });

  // Xóa tài liệu cũ
  db.seats.deleteOne({ _id: doc._id });
});

print("Cập nhật _id, branch, theater và adjacentSeats hoàn tất!");
