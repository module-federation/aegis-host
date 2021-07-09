

export const Event = {

  async listen(topic, callback) {
    setTimeout(() => callback({ topic, message: 'test' }), 1000);
  }

}