import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  MenuContext,
  type ErrorType,
  type get_menu_params,
  type ItemStatus,
  type MenuContextType,
  type MenuPage,
} from "../types/menu.types";
import type { apiInterfaceType } from "../types/user.type";
import {
  add_menu,
  delete_item,
  get_menu,
  toggleState,
  update_menu,
  type MenuFetchMode,
} from "../api/api.menu";
import toast from "react-hot-toast";

interface MenuProviderProps extends apiInterfaceType {
  mode?: MenuFetchMode;
  restaurantId?: string;
}

export const MenuProvider = ({
  children,
  mode = "global",         // default is explore — safest for the global wrap in main.tsx
  restaurantId,
}: MenuProviderProps) => {
  const queryClient = useQueryClient();

  // Scoped cache key — each mode+id combo gets its own cache bucket
  const queryKey: unknown[] =
    mode === "restaurant" && restaurantId
      ? ["menu", mode, restaurantId]
      : ["menu", mode];

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isFetching,
    isError,
    error,
  } = useInfiniteQuery<MenuPage, ErrorType>({
    queryKey:['menu'],
    queryFn: ({ pageParam }) =>
      get_menu({
        pageParam: pageParam,
        mode,
        restaurantId: mode === "restaurant" ? restaurantId : undefined,
      }) ,
    getNextPageParam: (lastPage) => lastPage.pagination.nextPage ?? undefined,
    initialPageParam: 1,
    staleTime: 1000 * 60 * 5,
    retry: false,
    // Don't run at all if restaurant mode is missing its ID
    enabled: mode !== "restaurant" || !!restaurantId,
  });

  const menu_items = data?.pages.flatMap((page) => page.msg) ?? [];

  // ── Mutations ────────────────────────────────────────────────────────────

  const createMenu = useMutation({
    mutationFn: add_menu,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast.success("Menu item added successfully!");
    },
    onError: (error: ErrorType) => {
      toast.error(error?.msg || "Failed to add menu item.");
    },
  });

  const deleteMenuItem = useMutation({
    mutationFn: delete_item,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast.success("Menu item deleted!");
    },
    onError: (error: ErrorType) => {
      toast.error(error?.msg || "Failed to delete menu item.");
    },
  });

  const updateMenuItem = useMutation({
    mutationFn: async ({
      formData,
      public_id,
      id,
    }: {
      formData: FormData;
      public_id: string;
      id: string;
    }) => update_menu(formData, public_id, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast.success("Menu updated!");
    },
    onError: (error: ErrorType) => {
      toast.error(error?.msg || "Failed to update menu.");
    },
  });

  const toggleItemStatus = useMutation({
    mutationFn: ({ item_id, status }: { item_id: string; status: ItemStatus }) =>
      toggleState(item_id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  return (
    <MenuContext.Provider
      value={{
        mutateCreateMenu: createMenu,
        mutateDeleteMenuItem: deleteMenuItem,
        mutateupdateMenuItem: updateMenuItem,
        mutateItemStatus: toggleItemStatus,
        menu_items,
        isLoading: isLoading || isFetching,
        errorMsg: isError ? (error?.msg || error?.message || "An error occurred") : null,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
      }}
    >
      {children}
    </MenuContext.Provider>
  );
};