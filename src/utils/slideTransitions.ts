import { SlideTransitionEffect, ElementAnimationEffect, BlockAnimationEffect } from '../types';

export interface TransitionPreset {
  id: SlideTransitionEffect;
  label: string;
  shortLabel: string;
  icon: string;
  description: string;
  category: 'standard' | 'dynamic' | '3d';
}

export interface ElementAnimationPreset {
  id: ElementAnimationEffect;
  label: string;
  icon: string;
  description: string;
}

export interface BlockAnimationPreset {
  id: BlockAnimationEffect;
  label: string;
  shortLabel: string;
  icon: string;
  description: string;
  category: 'slide' | 'zoom' | 'dynamic' | '3d';
}

export const BLOCK_ANIMATION_PRESETS: BlockAnimationPreset[] = [
  {
    id: 'inherit',
    label: 'Kế Thừa Slide (Mặc Định)',
    shortLabel: 'Kế Thừa',
    icon: '✨',
    description: 'Tự động sử dụng kiểu hoạt họa chung của toàn bộ slide',
    category: 'slide',
  },
  {
    id: 'fade_up',
    label: 'Trượt Từ Dưới Lên (Fly Up)',
    shortLabel: 'Trượt Lên',
    icon: '⬆️',
    description: 'Bay nhẹ từ dưới lên vị trí chính xác (phổ biến nhất)',
    category: 'slide',
  },
  {
    id: 'fade_down',
    label: 'Trượt Từ Trên Xuống (Fly Down)',
    shortLabel: 'Trượt Xuống',
    icon: '⬇️',
    description: 'Bay êm ái từ trên xuống, thích hợp cho tiêu đề bài học',
    category: 'slide',
  },
  {
    id: 'slide_left',
    label: 'Trượt Từ Trái Sang (Fly In Left)',
    shortLabel: 'Từ Trái',
    icon: '➡️',
    description: 'Bay từ phía bên trái vào, tạo nhịp dẫn dắt đọc',
    category: 'slide',
  },
  {
    id: 'slide_right',
    label: 'Trượt Từ Phải Sang (Fly In Right)',
    shortLabel: 'Từ Phải',
    icon: '⬅️',
    description: 'Bay từ phía bên phải vào, thích hợp cho ví dụ & bài tập',
    category: 'slide',
  },
  {
    id: 'zoom_in',
    label: 'Phóng To Bung Mở (Zoom In)',
    shortLabel: 'Phóng To',
    icon: '🔍',
    description: 'Bung mở từ tâm ra ngoài, thu hút sự chú ý cực mạnh',
    category: 'zoom',
  },
  {
    id: 'zoom_out',
    label: 'Thu Nhỏ Hiện Ra (Zoom Out)',
    shortLabel: 'Thu Nhỏ',
    icon: '🔎',
    description: 'Nội dung từ ngoài khung thu gọn êm ái vào vị trí',
    category: 'zoom',
  },
  {
    id: 'fade_in',
    label: 'Mờ Dần Hiện Rõ (Fade In)',
    shortLabel: 'Mờ Dần',
    icon: '🌫️',
    description: 'Tăng dần độ trong suốt êm dịu, không chuyển động tọa độ',
    category: 'slide',
  },
  {
    id: 'bounce',
    label: 'Nảy Lò Xo Đàn Hồi (Bounce)',
    shortLabel: 'Nảy Lò Xo',
    icon: '🤹',
    description: 'Hiệu ứng nảy hoạt họa vui nhộn, kích thích tư duy học sinh',
    category: 'dynamic',
  },
  {
    id: 'flip_x',
    label: 'Lật 3D Ngang (Flip X)',
    shortLabel: 'Lật Ngang',
    icon: '🔄',
    description: 'Lật vòng 3D quanh trục ngang, ấn tượng cho công thức & ghi nhớ',
    category: '3d',
  },
  {
    id: 'flip_y',
    label: 'Lật 3D Dọc (Flip Y)',
    shortLabel: 'Lật Dọc',
    icon: '🔃',
    description: 'Lật cánh cửa sổ 3D dọc cuốn hút',
    category: '3d',
  },
  {
    id: 'spin_in',
    label: 'Xoay Tròn Bung Ra (Spin In)',
    shortLabel: 'Xoay Tròn',
    icon: '🌪️',
    description: 'Xoay nhẹ kèm phóng to, làm nổi bật điểm cốt lõi',
    category: 'dynamic',
  },
  {
    id: 'pulse_glow',
    label: 'Phát Sáng Nổi Bật (Glow Pulse)',
    shortLabel: 'Phát Sáng',
    icon: '💡',
    description: 'Bừng sáng phát quang hào quang xung quanh khối kiến thức',
    category: 'dynamic',
  },
  {
    id: 'none',
    label: 'Hiện Ngay Lập Tức (None)',
    shortLabel: 'Hiện Ngay',
    icon: '⚡',
    description: 'Khối nội dung xuất hiện tức thì không có hiệu ứng chờ',
    category: 'slide',
  },
];

export const TRANSITION_PRESETS: TransitionPreset[] = [
  {
    id: 'slide_horizontal',
    label: 'Trượt Ngang (Push)',
    shortLabel: 'Trượt Ngang',
    icon: '↔️',
    description: 'Trượt từ phải sang trái hoặc ngược lại theo chiều chuyển slide',
    category: 'standard',
  },
  {
    id: 'fade',
    label: 'Mờ Dần (Fade)',
    shortLabel: 'Mờ Dần',
    icon: '🌫️',
    description: 'Chuyển cảnh mờ dần êm dịu, chuẩn phong cách PowerPoint cổ điển',
    category: 'standard',
  },
  {
    id: 'slide_vertical',
    label: 'Trượt Dọc (Push Up)',
    shortLabel: 'Trượt Dọc',
    icon: '↕️',
    description: 'Cuộn trượt mượt mà từ dưới lên hoặc từ trên xuống',
    category: 'standard',
  },
  {
    id: 'zoom',
    label: 'Thu Phóng (Zoom)',
    shortLabel: 'Thu Phóng',
    icon: '🔍',
    description: 'Phóng to thu nhỏ ấn tượng tạo điểm nhấn tập trung kiến thức',
    category: 'dynamic',
  },
  {
    id: 'flip',
    label: 'Lật 3D (3D Flip)',
    shortLabel: 'Lật 3D',
    icon: '🔄',
    description: 'Lật trang giáo án trong không gian 3 chiều sống động',
    category: '3d',
  },
  {
    id: 'wipe',
    label: 'Rèm Quét (Wipe)',
    shortLabel: 'Rèm Quét',
    icon: '🪟',
    description: 'Hiệu ứng mở màn rèm quét từ cạnh vào trung tâm',
    category: 'dynamic',
  },
  {
    id: 'bounce',
    label: 'Nảy Lò Xo (Bounce)',
    shortLabel: 'Nảy Lò Xo',
    icon: '🤹',
    description: 'Hiệu ứng nảy hoạt họa đàn hồi thu hút sự chú ý của học sinh',
    category: 'dynamic',
  },
  {
    id: 'none',
    label: 'Tức Thì (None)',
    shortLabel: 'Tức Thì',
    icon: '⚡',
    description: 'Chuyển trang ngay lập tức không có độ trễ hiệu ứng',
    category: 'standard',
  },
];

export const ELEMENT_ANIMATION_PRESETS: ElementAnimationPreset[] = [
  {
    id: 'stagger',
    label: 'Tuần Tự Từng Mục (Staggered)',
    icon: '🪜',
    description: 'Từng khối lý thuyết, ví dụ, bài tập lần lượt xuất hiện nối tiếp nhau',
  },
  {
    id: 'fade_up',
    label: 'Bay Từ Dưới Lên (Fade Up)',
    icon: '⬆️',
    description: 'Toàn bộ các khối nhẹ nhàng trượt từ dưới lên vị trí chuẩn',
  },
  {
    id: 'zoom_in',
    label: 'Phóng To Nhẹ (Zoom In)',
    icon: '🔍',
    description: 'Nội dung bung mở êm ái từ tâm ra ngoài',
  },
  {
    id: 'fade_in',
    label: 'Mờ Dần Hiện Rõ (Fade In)',
    icon: '🌟',
    description: 'Khối nội dung nhẹ nhàng tăng dần độ tương phản',
  },
  {
    id: 'none',
    label: 'Hiển Thị Cùng Lúc (None)',
    icon: '⚡',
    description: 'Toàn bộ nội dung hiển thị ngay lập tức',
  },
];

export const SPEED_PRESETS = [
  { value: 0.25, label: 'Nhanh (0.25s)', badge: 'Nhanh' },
  { value: 0.45, label: 'Chuẩn (0.45s)', badge: 'Chuẩn' },
  { value: 0.75, label: 'Chậm & Mượt (0.75s)', badge: 'Chậm' },
];

export const AUTOPLAY_PRESETS = [
  { value: 0, label: 'Tắt Tự Động' },
  { value: 5, label: '5 giây / Slide' },
  { value: 10, label: '10 giây / Slide' },
  { value: 15, label: '15 giây / Slide' },
  { value: 30, label: '30 giây / Slide' },
];

/**
 * Returns motion animation variants for the slide container based on transition effect and navigation direction
 */
export function getSlideVariants(
  effect: SlideTransitionEffect = 'slide_horizontal',
  direction: number = 1,
  duration: number = 0.45
) {
  const transitionConfig = {
    duration,
    ease: [0.25, 0.1, 0.25, 1.0], // smooth cubic bezier
  };

  switch (effect) {
    case 'fade':
      return {
        initial: { opacity: 0 },
        animate: { opacity: 1, transition: transitionConfig },
        exit: { opacity: 0, transition: { duration: duration * 0.75 } },
      };

    case 'slide_horizontal':
      return {
        initial: {
          x: direction > 0 ? '60%' : '-60%',
          opacity: 0,
          scale: 0.96,
        },
        animate: {
          x: 0,
          opacity: 1,
          scale: 1,
          transition: transitionConfig,
        },
        exit: {
          x: direction > 0 ? '-60%' : '60%',
          opacity: 0,
          scale: 0.96,
          transition: { duration: duration * 0.8 },
        },
      };

    case 'slide_vertical':
      return {
        initial: {
          y: direction > 0 ? '50%' : '-50%',
          opacity: 0,
          scale: 0.96,
        },
        animate: {
          y: 0,
          opacity: 1,
          scale: 1,
          transition: transitionConfig,
        },
        exit: {
          y: direction > 0 ? '-50%' : '50%',
          opacity: 0,
          scale: 0.96,
          transition: { duration: duration * 0.8 },
        },
      };

    case 'zoom':
      return {
        initial: {
          scale: direction > 0 ? 0.75 : 1.25,
          opacity: 0,
        },
        animate: {
          scale: 1,
          opacity: 1,
          transition: transitionConfig,
        },
        exit: {
          scale: direction > 0 ? 1.25 : 0.75,
          opacity: 0,
          transition: { duration: duration * 0.8 },
        },
      };

    case 'flip':
      return {
        initial: {
          rotateY: direction > 0 ? 80 : -80,
          opacity: 0,
          scale: 0.88,
        },
        animate: {
          rotateY: 0,
          opacity: 1,
          scale: 1,
          transition: {
            duration,
            ease: [0.34, 1.56, 0.64, 1], // spring-like settle
          },
        },
        exit: {
          rotateY: direction > 0 ? -80 : 80,
          opacity: 0,
          scale: 0.88,
          transition: { duration: duration * 0.75 },
        },
      };

    case 'wipe':
      return {
        initial: {
          clipPath: direction > 0 ? 'inset(0% 100% 0% 0%)' : 'inset(0% 0% 0% 100%)',
          opacity: 0.6,
        },
        animate: {
          clipPath: 'inset(0% 0% 0% 0%)',
          opacity: 1,
          transition: transitionConfig,
        },
        exit: {
          clipPath: direction > 0 ? 'inset(0% 0% 0% 100%)' : 'inset(0% 100% 0% 0%)',
          opacity: 0.6,
          transition: { duration: duration * 0.8 },
        },
      };

    case 'bounce':
      return {
        initial: {
          y: direction > 0 ? 80 : -80,
          scale: 0.85,
          opacity: 0,
        },
        animate: {
          y: 0,
          scale: 1,
          opacity: 1,
          transition: {
            type: 'spring',
            stiffness: 260,
            damping: 18,
            duration,
          },
        },
        exit: {
          y: direction > 0 ? -60 : 60,
          scale: 0.85,
          opacity: 0,
          transition: { duration: duration * 0.75 },
        },
      };

    case 'none':
    default:
      return {
        initial: { opacity: 1 },
        animate: { opacity: 1, transition: { duration: 0 } },
        exit: { opacity: 1, transition: { duration: 0 } },
      };
  }
}

/**
 * Returns element animation delay and variants
 */
export function getElementVariants(
  animation: ElementAnimationEffect = 'stagger',
  index: number = 0
) {
  const baseDelay = animation === 'stagger' ? Math.min(index * 0.08, 0.6) : 0.05;

  switch (animation) {
    case 'stagger':
    case 'fade_up':
      return {
        initial: { opacity: 0, y: 16 },
        animate: {
          opacity: 1,
          y: 0,
          transition: {
            duration: 0.35,
            delay: baseDelay,
            ease: [0.25, 0.1, 0.25, 1.0],
          },
        },
      };

    case 'zoom_in':
      return {
        initial: { opacity: 0, scale: 0.94 },
        animate: {
          opacity: 1,
          scale: 1,
          transition: {
            duration: 0.35,
            delay: baseDelay,
            ease: [0.25, 0.1, 0.25, 1.0],
          },
        },
      };

    case 'fade_in':
      return {
        initial: { opacity: 0 },
        animate: {
          opacity: 1,
          transition: {
            duration: 0.35,
            delay: baseDelay,
          },
        },
      };

    case 'none':
    default:
      return {
        initial: { opacity: 1 },
        animate: { opacity: 1 },
      };
  }
}

/**
 * Returns motion animation variants for an individual block on a slide
 */
export function getBlockVariants(
  blockAnimation: BlockAnimationEffect = 'inherit',
  slideDefaultAnimation: ElementAnimationEffect = 'stagger',
  index: number = 0,
  customDelay?: number,
  customDuration?: number
) {
  // If blockAnimation is 'inherit', map to slide default animation
  const effectiveAnimation: BlockAnimationEffect =
    blockAnimation === 'inherit'
      ? slideDefaultAnimation === 'fade_up'
        ? 'fade_up'
        : slideDefaultAnimation === 'fade_in'
        ? 'fade_in'
        : slideDefaultAnimation === 'zoom_in'
        ? 'zoom_in'
        : slideDefaultAnimation === 'none'
        ? 'none'
        : 'fade_up' // 'stagger' defaults to fade_up with staggered delay
      : blockAnimation;

  // Determine delay: if customDelay is explicitly provided (>= 0), use it;
  // otherwise, if slide default is 'stagger', use index * 0.12s; else 0.05s.
  const delay =
    typeof customDelay === 'number' && customDelay >= 0
      ? customDelay
      : slideDefaultAnimation === 'stagger'
      ? Math.min(index * 0.12, 1.5)
      : 0.05;

  const duration =
    typeof customDuration === 'number' && customDuration > 0
      ? customDuration
      : 0.42;

  switch (effectiveAnimation) {
    case 'fade_up':
      return {
        initial: { opacity: 0, y: 28 },
        animate: {
          opacity: 1,
          y: 0,
          transition: {
            duration,
            delay,
            ease: [0.22, 1, 0.36, 1],
          },
        },
      };

    case 'fade_down':
      return {
        initial: { opacity: 0, y: -28 },
        animate: {
          opacity: 1,
          y: 0,
          transition: {
            duration,
            delay,
            ease: [0.22, 1, 0.36, 1],
          },
        },
      };

    case 'slide_left':
      return {
        initial: { opacity: 0, x: -50 },
        animate: {
          opacity: 1,
          x: 0,
          transition: {
            duration,
            delay,
            ease: [0.22, 1, 0.36, 1],
          },
        },
      };

    case 'slide_right':
      return {
        initial: { opacity: 0, x: 50 },
        animate: {
          opacity: 1,
          x: 0,
          transition: {
            duration,
            delay,
            ease: [0.22, 1, 0.36, 1],
          },
        },
      };

    case 'zoom_in':
      return {
        initial: { opacity: 0, scale: 0.86 },
        animate: {
          opacity: 1,
          scale: 1,
          transition: {
            duration,
            delay,
            ease: [0.34, 1.45, 0.64, 1],
          },
        },
      };

    case 'zoom_out':
      return {
        initial: { opacity: 0, scale: 1.15 },
        animate: {
          opacity: 1,
          scale: 1,
          transition: {
            duration,
            delay,
            ease: [0.22, 1, 0.36, 1],
          },
        },
      };

    case 'fade_in':
      return {
        initial: { opacity: 0 },
        animate: {
          opacity: 1,
          transition: {
            duration,
            delay,
          },
        },
      };

    case 'bounce':
      return {
        initial: { opacity: 0, y: 35, scale: 0.8 },
        animate: {
          opacity: 1,
          y: 0,
          scale: 1,
          transition: {
            type: 'spring',
            stiffness: 300,
            damping: 15,
            delay,
            duration,
          },
        },
      };

    case 'flip_x':
      return {
        initial: { opacity: 0, rotateX: 75, transformPerspective: 800 },
        animate: {
          opacity: 1,
          rotateX: 0,
          transformPerspective: 800,
          transition: {
            duration: duration * 1.2,
            delay,
            ease: [0.22, 1, 0.36, 1],
          },
        },
      };

    case 'flip_y':
      return {
        initial: { opacity: 0, rotateY: 75, transformPerspective: 800 },
        animate: {
          opacity: 1,
          rotateY: 0,
          transformPerspective: 800,
          transition: {
            duration: duration * 1.2,
            delay,
            ease: [0.22, 1, 0.36, 1],
          },
        },
      };

    case 'spin_in':
      return {
        initial: { opacity: 0, rotate: -15, scale: 0.85 },
        animate: {
          opacity: 1,
          rotate: 0,
          scale: 1,
          transition: {
            duration,
            delay,
            ease: [0.34, 1.4, 0.64, 1],
          },
        },
      };

    case 'pulse_glow':
      return {
        initial: { opacity: 0, scale: 0.94 },
        animate: {
          opacity: 1,
          scale: [0.94, 1.03, 1],
          transition: {
            duration: duration * 1.3,
            delay,
            times: [0, 0.6, 1],
          },
        },
      };

    case 'none':
    default:
      return {
        initial: { opacity: 1 },
        animate: { opacity: 1, transition: { duration: 0 } },
      };
  }
}
