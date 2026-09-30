import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { BlogRenderer } from "../src/components/blog-renderer";

describe("BlogRenderer with videoEmbed nodes", () => {
  const renderDocument = (src: string) => {
    const doc = {
      type: "doc",
      content: [
        {
          type: "videoEmbed",
          attrs: { src, provider: "youtube" },
        },
      ],
    };
    return renderToStaticMarkup(React.createElement(BlogRenderer, { content: doc }));
  };

  test("Renders YouTube embed with expected sandbox attr", () => {
    const html = renderDocument("https://www.youtube.com/embed/dQw4w9WgXcQ");
    assert.ok(html.includes("<iframe"), "should contain an iframe");
    assert.ok(
      html.includes('src="https://www.youtube.com/embed/dQw4w9WgXcQ"'),
      "should contain exact src",
    );
    assert.ok(
      html.includes('sandbox="allow-scripts allow-same-origin allow-presentation allow-popups"'),
      "should contain sandbox attribute",
    );
  });

  test("Renders YouTube nocookie embed", () => {
    const html = renderDocument("https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ");
    assert.ok(html.includes('src="https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ"'));
  });

  test("Renders Vimeo embed", () => {
    const html = renderDocument("https://player.vimeo.com/video/987654321");
    assert.ok(html.includes('src="https://player.vimeo.com/video/987654321"'));
  });

  test("Renders nothing for evil domain", () => {
    const html = renderDocument("https://youtube.com.evil.com/embed/dQw4w9WgXcQ");
    assert.ok(!html.includes("<iframe"), "should NOT contain an iframe for evil src");
  });
});
