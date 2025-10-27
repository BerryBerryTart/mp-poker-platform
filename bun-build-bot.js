await Bun.build({
  entrypoints: ["./backend/bot.ts"],
  outdir: "dist-backend",
  target: "node",
  minify: true,
});
