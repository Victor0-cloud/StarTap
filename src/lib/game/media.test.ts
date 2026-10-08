import test from "node:test";
import assert from "node:assert/strict";
import { portalLinks } from "./media.ts";
test("no media or unusable destinations produce no portal links",()=>{
 for(const media of [undefined,{}, {watchUrl:""}, {watchUrl:"javascript:alert(1)"}, {listenUrl:"/local"},{discoverUrl:"https://user:secret@example.com/"},{watchUrl:"http://example.com/"}]) assert.deepEqual(portalLinks(media),[]);
});
test("optional links retain their kinds, labels and exact destination without fabrication",()=>{
 assert.deepEqual(portalLinks({listenUrl:"https://adele.lnk.to/30outnow",listenLabel:"30",discoverUrl:"https://www.adele.com/"}),[
 {kind:"listen",href:"https://adele.lnk.to/30outnow",label:"30"},
 {kind:"discover",href:"https://www.adele.com/",label:"DISCOVER"}]);
 assert.deepEqual(portalLinks({watchUrl:"https://www.youtube.com/watch?v=jDvYDzFOK9A",watchLabel:"Official video"})[0],{kind:"watch",href:"https://www.youtube.com/watch?v=jDvYDzFOK9A",label:"Official video"});
});
