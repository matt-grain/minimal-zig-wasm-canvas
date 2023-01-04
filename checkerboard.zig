const std = @import("std");
const String = @import("zig-string.zig").String;
const Console = @import("JS.zig").Console;

const checkerboard_size: usize = 8;

// 8 x 8 pixels, where each pixel is 4 bytes (rgba)
var checkerboard_buffer = std.mem.zeroes([checkerboard_size][checkerboard_size][4]u8);

// The returned pointer will be used as an offset integer to the wasm memory
export fn getCheckerboardBufferPointer() [*]u8 {
    return @ptrCast([*]u8, &checkerboard_buffer);
}

export fn stringCheck() void {
    const alloc: std.mem.Allocator = std.heap.page_allocator;

    // create strings
    Console.log("Allocating string for scroller text", .{});
    var text_str: String = String.init(alloc);
    defer text_str.deinit();

    if (text_str.concat("Hellllloooo where are the cool kids ??????????????")) |_| {
        Console.log("String created: {s}", .{text_str.str()});
    } else |err| {
        Console.log("failed: {s}", .{@errorName(err)});
    }
}

export fn colorCheckerboard(
    dark_value_red: u8,
    dark_value_green: u8,
    dark_value_blue: u8,
    light_value_red: u8,
    light_value_green: u8,
    light_value_blue: u8,
) void {
    for (checkerboard_buffer) |*row, y| {
        for (row) |*square, x| {
            var is_dark_square = true;

            if ((y % 2) == 0) {
                is_dark_square = false;
            }

            if ((x % 2) == 0) {
                is_dark_square = !is_dark_square;
            }

            var square_value_red = dark_value_red;
            var square_value_green = dark_value_green;
            var square_value_blue = dark_value_blue;
            if (!is_dark_square) {
                square_value_red = light_value_red;
                square_value_green = light_value_green;
                square_value_blue = light_value_blue;
            }

            square.*[0] = square_value_red;
            square.*[1] = square_value_green;
            square.*[2] = square_value_blue;
            square.*[3] = 255;
        }
    }
}
