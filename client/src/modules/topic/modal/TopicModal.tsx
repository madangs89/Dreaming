import React, { memo, useState } from "react";
import Spinner from "../../../components/Spinner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createTopic } from "../topic.api";
import toast from "react-hot-toast";
import type { AxiosError } from "axios";

type TopicModalProps = {
  open: boolean;
  onClose: () => void;
};

const TopicModal = memo(({ open = false, onClose }: TopicModalProps) => {
  const [title, setTitle] = useState("");
  const [image, setImage] = useState<File | null>(null);

  const queryClient = useQueryClient();

  const topicMutation = useMutation({
    mutationFn: createTopic,
    onSuccess: () => {
      toast.success("Topic created successfully!");
      queryClient.invalidateQueries({ queryKey: ["topics"] });
      setTitle("");
      setImage(null);
      onClose();
    },
    onError: (error: AxiosError<{ message: string }>) => {
      toast.error(error.response?.data.message || "Failed to create topic.");
    },
  });

  const handleSubmit = () => {
    if (topicMutation.isPending) {
      toast.error("Topic creation in progress. Please wait.");
      return;
    }
    if (!title.trim()) {
      toast.error("Topic name cannot be empty.");
      return;
    }

    if (!image) {
      topicMutation.mutate({ title, image: null });
      return;
    }
    topicMutation.mutate({ title, image });
  };

  const handleClose = () => {
    if (topicMutation.isPending) return;
    setTitle("");
    setImage(null);
    onClose();
  };

  if (!open) return null;

  return (
    <div
      className="
        fixed
        inset-0
        z-[100]
        bg-black/20
        backdrop-blur-sm
        flex
        items-center
        justify-center
        p-4
      "
      onClick={handleClose}
    >
      <div
        onClick={(e: React.MouseEvent<HTMLDivElement>) => e.stopPropagation()}
        className="
          relative
          w-full
          max-w-lg
          bg-white
          rounded-3xl
          shadow-2xl
          p-6
          sm:p-8
        "
      >
        {/* Close */}
        <button
          onClick={handleClose}
          className="
            absolute
            top-5
            right-5
            text-gray-400
            hover:text-black
            transition
          "
        >
          ✕
        </button>

        {/* Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-semibold">Create Topic</h2>

          <p className="text-gray-500 mt-2">
            Create a topic and start organizing your notes.
          </p>
        </div>

        {/* Topic Name */}
        <div>
          <label className="block text-sm font-medium mb-2">Topic Name</label>

          <input
            type="text"
            placeholder="e.g. React JS"
            value={title}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setTitle(e.target.value)
            }
            className="
              w-full
              h-12
              px-4
              rounded-xl
              border
              border-gray-300
              outline-none
              focus:border-black
            "
          />
        </div>

        {/* Image Upload */}
        <div className="mt-5">
          <label className="block text-sm font-medium mb-2">
            Cover Image (Optional)
          </label>

          <label
            className="
              border-2
              border-dashed
              border-gray-300
              rounded-2xl
              h-40
              flex
              flex-col
              items-center
              justify-center
              cursor-pointer
              hover:border-black
              transition
            "
          >
            <input
              type="file"
              name="source"
              accept="image/*"
              className="hidden"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setImage(e.target.files?.[0] || null)
              }
            />

            {image ? (
              <>
                <p className="font-medium">{image.name}</p>
                <p className="text-sm text-gray-500">Click to change</p>
              </>
            ) : (
              <>
                <span className="text-4xl">📷</span>
                <p className="mt-2 font-medium">Upload Cover Image</p>
                <p className="text-sm text-gray-500">PNG, JPG, WEBP</p>
              </>
            )}
          </label>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-8">
          <button
            onClick={handleClose}
            className="
              flex-1
              h-12
              rounded-xl
              border
              border-gray-300
              font-medium
              hover:bg-gray-50
            "
          >
            Cancel
          </button>

          <button
            disabled={topicMutation.isPending || !title.trim()}
            onClick={handleSubmit}
            className="
              flex-1
              h-12
              rounded-xl
              bg-black
              text-white
              font-medium
              hover:opacity-90
              flex
              items-center
              justify-center
            "
          >
            {topicMutation.isPending ? <Spinner /> : "Create Topic"}
          </button>
        </div>
      </div>
    </div>
  );
});

export default TopicModal;
