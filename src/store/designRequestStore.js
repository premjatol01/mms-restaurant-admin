import { create } from "zustand";
import { defaultDesignRequests } from "../pages/menu/data/designRequests";

/**
 * Contact Designer requests submitted by the Restaurant Admin.
 * The Super Admin / designer side reads from this list.
 *
 * TODO (API): replace addRequest's local set() with an upload (FormData with
 * `description` + `attachment.file`) and push the server response instead.
 */
export const useDesignRequestStore = create((set) => ({
  requests: [...defaultDesignRequests],

  addRequest: ({ description, file = null }) => {
    const request = {
      id: `dr-${Date.now()}`,
      description,
      attachment: file
        ? { name: file.name, size: file.size, type: file.type, file }
        : null,
      status: "pending",
      createdAt: new Date().toISOString(),
    };
    set((state) => ({ requests: [request, ...state.requests] }));
    return request;
  },
}));
