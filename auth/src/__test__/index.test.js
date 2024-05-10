const mongoose = require("mongoose");
const natsWrapper = require("../nats-wrapper");

it("connectToMongoDb should log success message on successful connection", async () => {
    expect(mongoose.connection.readyState).toBe(1);
});

it("connectToMongoDb should log error message on failed connection", async () => {
    jest.spyOn(mongoose, "connect")

    expect(mongoose.connection.readyState).toBe(0);
});
it("connectToNats should log success message on successful connection", async () => {
    // Tạo một mock cho natsWrapper.connect và console.log
    const mockConnect = jest.spyOn(natsWrapper, "connect").mockResolvedValue();
    const mockLog = jest.spyOn(console, "log");

    // Gọi hàm connectToNats
    await connectToNats();

    // Kiểm tra xem natsWrapper.connect đã được gọi
    expect(mockConnect).toHaveBeenCalledWith(
        process.env.NATS_CLUSTER_ID,
        process.env.NATS_CLIENT_ID,
        process.env.NATS_URL
    );

    // Kiểm tra xem console.log đã được gọi với thông báo thành công
    expect(mockLog).toHaveBeenCalledWith("Ket noi thanh cong toi nats");
});

it("connectToNats should log error message on failed connection", async () => {
    // Tạo một mock cho natsWrapper.connect và console.log
    const mockConnect = jest.spyOn(natsWrapper, "connect").mockRejectedValue(new Error("Connection error"));
    const mockLog = jest.spyOn(console, "log");

    // Gọi hàm connectToNats
    await connectToNats();

    // Kiểm tra xem natsWrapper.connect đã được gọi
    expect(mockConnect).toHaveBeenCalledWith(
        process.env.NATS_CLUSTER_ID,
        process.env.NATS_CLIENT_ID,
        process.env.NATS_URL
    );

    // Kiểm tra xem console.log đã được gọi với thông báo lỗi
    expect(mockLog).toHaveBeenCalledWith("Kết nối thất bại tới nats", new Error("Connection error"));
});