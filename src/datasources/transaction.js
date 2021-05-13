/**
 * @todo implement federated transaction (2-phase)
 * to cut down on eventual consistency
 * @param {import("../models").Model[]} models
 * @param {{model1:*,model2:*}} updates
 * @returns
 */
export const Transaction = function (models, updates) {
  return {
    modified: null,

    async vote() {
      this.modified = await Promise.all(
        models.map(async m => ({ new: await m.vote(updates[m]), old: m }))
      );
      return this;
    },

    rollback() {
      this.modified.map(m => m.old.commit());
    },

    async commit() {
      try {
        await Promise.all(this.modified.map(m => m.new.then(m => m.commit())));
        console.log("transaction complete");
      } catch (error) {
        this.rollback();
        throw new Error("transaction rolled back");
      }
    },
  };
};
