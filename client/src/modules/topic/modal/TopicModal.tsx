import React, { memo, useState } from "react";
import Spinner from "../../../components/Spinner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createTopic } from "../topic.api";
import toast from "react-hot-toast";
import type { AxiosError } from "axios";
import { useTheme } from "../../../hooks/useTheme";
import { useAppSelector } from "../../../app/hook";

type TopicModalProps = {
  open: boolean;
  onClose: () => void;
};

const TopicModal = memo(({ open = false, onClose }: TopicModalProps) => {
  const [title, setTitle] = useState("");
  const [image, setImage] = useState<File | null>(null);

  const theme = useAppSelector((state) => state.theme.theme);

  const {
    bg,
    cardBorder,
    subtleText,
    titleColor,
    primaryBtnBg,
    primaryBtnText,
    primaryBtnHover,
    backdropBg,
    menuBtnBgHover,
  } = useTheme(theme);

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
      style={{ backgroundColor: backdropBg }}
      className="
        fixed
        inset-0
        z-[100]
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
        style={{ backgroundColor: bg }}
        className="
          relative
          w-full
          max-w-lg
          rounded-3xl
          shadow-2xl
          p-6
          sm:p-8
        "
      >
        {/* Close */}
        <button
          onClick={handleClose}
          style={{ color: subtleText }}
          onMouseEnter={(e) => (e.currentTarget.style.color = titleColor)}
          onMouseLeave={(e) => (e.currentTarget.style.color = subtleText)}
          className="
            absolute
            top-5
            right-5
            transition
          "
        >
          ✕
        </button>

        {/* Header */}
        <div className="mb-8">
          <h2 style={{ color: titleColor }} className="text-3xl font-semibold">
            Create Topic
          </h2>

          <p style={{ color: subtleText }} className="mt-2">
            Create a topic and start organizing your notes.
          </p>
        </div>

        {/* Topic Name */}
        <div>
          <label
            style={{ color: titleColor }}
            className="block text-sm font-medium mb-2"
          >
            Topic Name
          </label>

          <input
            type="text"
            placeholder="e.g. React JS"
            value={title}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setTitle(e.target.value)
            }
            style={{ borderColor: cardBorder, color: titleColor }}
            onFocus={(e) => (e.currentTarget.style.borderColor = titleColor)}
            onBlur={(e) => (e.currentTarget.style.borderColor = cardBorder)}
            className="
              w-full
              h-12
              px-4
              rounded-xl
              border
              outline-none
            "
          />
        </div>

        {/* Image Upload */}
        <div className="mt-5">
          <label
            style={{ color: titleColor }}
            className="block text-sm font-medium mb-2"
          >
            Cover Image (Optional)
          </label>

          <label
            style={{ borderColor: cardBorder }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.borderColor = titleColor)
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.borderColor = cardBorder)
            }
            className="
              border-2
              border-dashed
              rounded-2xl
              h-40
              flex
              flex-col
              items-center
              justify-center
              cursor-pointer
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
                <p style={{ color: titleColor }} className="font-medium">
                  {image.name}
                </p>
                <p style={{ color: subtleText }} className="text-sm">
                  Click to change
                </p>
              </>
            ) : (
              <>
                <span className="text-4xl">📷</span>
                <p style={{ color: titleColor }} className="mt-2 font-medium">
                  Upload Cover Image
                </p>
                <p style={{ color: subtleText }} className="text-sm">
                  PNG, JPG, WEBP
                </p>
              </>
            )}
          </label>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-8">
          <button
            onClick={handleClose}
            style={{ borderColor: cardBorder, color: titleColor }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = menuBtnBgHover)
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "transparent")
            }
            className="
              flex-1
              h-12
              rounded-xl
              border
              font-medium
            "
          >
            Cancel
          </button>

          <button
            disabled={topicMutation.isPending || !title.trim()}
            onClick={handleSubmit}
            style={{ backgroundColor: primaryBtnBg, color: primaryBtnText }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = primaryBtnHover)
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = primaryBtnBg)
            }
            className="
              flex-1
              h-12
              rounded-xl
              font-medium
              flex
              items-center
              justify-center
              transition-colors
              duration-200
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
