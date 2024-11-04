<?php

namespace App\Http\Controllers;

use App\Models\Post;
use Intervention\Image\Facades\Image;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class PostController extends Controller
{
    public function index()
    {
        $posts = Post::query()
            ->orderBy('created_at', 'desc')
            ->paginate(50);

        $data['posts'] = $posts;

        return response()->json($data);
    }

    private static function isPortrait(int $width, int $height): bool
    {
        return $height > $width;
    }

    public function upload()
    {
        if (!request()->hasFile('attachment')) {
            abort(422);
        }

        if (!request()->has('width')) {
            abort(422);
        }

        if (!request()->has('height')) {
            abort(422);
        }

        return response()->json($this->uploadPost(
            request()->file('attachment'),
            request()->get('width'),
            request()->get('height')
        ));
    }

    private function uploadPost($file, int $width, int $height)
    {
            $attachmentPath = 'attachments/'.Str::uuid().'.jpg';
             $thumbnailPath = 'attachment-thumbnails/'.Str::uuid().'.jpg';

           $attachment = Image::make($file);
            $thumbnail = Image::make($file);
        $miniThumbnail = Image::make($file);

        $aspectRatio = $width / $height;

        $hasWrongRotation =
            self::isPortrait($width, $height) &&
            !self::isPortrait($attachment->width(), $attachment->height());

        if ($hasWrongRotation) {
            $attachment->rotate(270);
            $thumbnail->rotate(270);
        }

        $attachment->encode('png', 100);

        $attachment->backup();
        $averageColor = $attachment->limitColors(1)->pickColor(0, 0, 'hex');
        $attachment->reset();

        $miniThumbnail->resize(24, 24 / $aspectRatio);
        $miniThumbnail->blur(2);
        $miniThumbnail->encode('png');

        $thumbnail->resize(512, 512 / $aspectRatio);
        $thumbnail->encode('jpg', 75);

        Storage::disk()->put($attachmentPath,     (string)$attachment   );
        Storage::disk()->put($thumbnailPath,      (string)$thumbnail    );

        $attachmentUrl = Storage::url($attachmentPath);
         $thumbnailUrl = Storage::url( $thumbnailPath);

        $miniThumbnailData = (string)$miniThumbnail->encode('data-url');

        return Post::create([
            'width'  => $attachment->width(),
            'height' => $attachment->height(),
            'average_color' => $averageColor,
            'mini_thumbnail' => $miniThumbnailData,
            'attachment_url' => $attachmentUrl,
            'attachment_thumbnail_url' => $thumbnailUrl,
        ]);
    }

    public function downloadFile($url, $mime)
    {
        $fileContents = file_get_contents($url);
        $filename = basename($url);
    
        return response($fileContents)
            ->header('Content-Type', $mime)
            ->header(
                'Content-Disposition',
                'attachment; filename="' . $filename . '"'
            );
    }

    public function download(Post $post)
    {
        return $this->downloadFile($post->attachment_url, 'image/jpeg');
    }
    
    public function delete(Post $post)
    {
        $post->delete();
    }
}