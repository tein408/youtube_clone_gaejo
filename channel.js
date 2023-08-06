const channelInfoApi = 'https://oreumi.appspot.com/channel/getChannelInfo?video_channel=oreumi';
const channelVideoListApi = 'https://oreumi.appspot.com/channel/getChannelVideo?video_channel=oreumi';

async function getChannelInfo(channelName) {
    let newUrl = `https://oreumi.appspot.com/channel/getChannelInfo?video_channel=${channelName}`;
    try {
        const response = await fetch(newUrl, {
            method: 'POST'
        });
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('API 호출에 실패했습니다:', error);
    }
}

async function getChannelVideo(channelName) {
    let newUrl = `https://oreumi.appspot.com/channel/getChannelVideo?video_channel=${channelName}`;
    try {
        const response = await fetch(newUrl, {
            method: 'POST'
        });
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('API 호출에 실패했습니다:', error);
    }
}

async function getVideoData(videoId) {
    try {
        const apiUrl = `https://oreumi.appspot.com/video/getVideoInfo?video_id=${videoId}`;
        const response = await fetch(apiUrl);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('API 호출에 실패했습니다:', error);
    }
}

function timeForToday(value) {
    const today = new Date();
    const timeValue = new Date(value);

    const betweenTime = Math.floor((today.getTime() - timeValue.getTime()) / 1000 / 60);
    if (betweenTime < 1) return '방금전';
    if (betweenTime < 60) {
        return `${betweenTime}분 전`;
    }

    const betweenTimeHour = Math.floor(betweenTime / 60);
    if (betweenTimeHour < 24) {
        return `${betweenTimeHour}시간 전`;
    }

    const betweenWeek = Math.floor(betweenTime / 60 / 24 / 7);
    if (betweenWeek > 1 && betweenWeek <= 4) {
        return `${betweenWeek}주 전`;
    }

    const betweenMonth = Math.floor(betweenTime / 60 / 24 / 30);
    if (betweenMonth >= 1 && betweenMonth < 30) {
        return `${betweenMonth}개월 전`;
    }

    const betweenTimeDay = Math.floor(betweenTime / 60 / 24);
    if (betweenTimeDay < 365) {
        return `${betweenTimeDay}일 전`;
    }


    return `${Math.floor(betweenTimeDay / 365)}년 전`;
}

function formatCount(count) {
    if (count < 1000) {
        return `${count.toString()}`;
    } else if (count < 1000000) {
        const thousands = (count / 1000).toFixed(1);
        return `${thousands}K`;
    } else {
        const millions = (count / 1000000).toFixed(1);
        return `${millions}M`;
    }
}

async function displayMainVideo(videoInfoList) {
    let mainVideo = document.querySelector('.small-video .player video');
    let mainVideoTitle = document.querySelector('.small-video-desc .video-title .title');
    let mainVideoTime = document.querySelector('.small-video-desc .video-title .time');
    let mainVideoDesc = document.querySelector('.small-video-desc .descriptions');
    
    let viewscount = 0;
    let maxViewVideoId = 0;
    
    for (let i = 0; i < videoInfoList.length; i++) {
        let vInfo = videoInfoList[i];
        if (vInfo.views > viewscount) {
            viewscount = vInfo.views;
            maxViewVideoId = vInfo.video_id;
        }
    }

    let videoInfo = videoInfoList.find(v => v.video_id === maxViewVideoId);

    let uploadTime = timeForToday(videoInfo.upload_date);
    mainVideo.src = videoInfo.video_link;
    mainVideoTitle.innerText = videoInfo.video_title;
    mainVideoTitle.setAttribute("title", videoInfo.video_title);
    mainVideoTime.innerText = videoInfo.views.toLocaleString() + ' views · ' + uploadTime;
    mainVideoDesc.innerText = videoInfo.video_detail;

}

function hoverPlay(thumbnailItems) {
    for (let i = 0; i < thumbnailItems.length; i++) {
        let item = thumbnailItems[i];
        let thumbnailPic = item.querySelector('.xsamll-video-img');
        let current = item.querySelector('.xsamll-video-video');
        let videoTime = item.querySelector('.video-time');

        item.addEventListener('mouseenter', function() {
            timeoutId = setTimeout(function() {
                current.style.display = "block";
                videoTime.style.display = "none";
                thumbnailPic.style.height = "0px";
                current.muted = true;
                current.play();
            }, 500);
        });

        item.addEventListener('mouseleave', function() {
            clearTimeout(timeoutId);
            current.currentTime = 0;
            current.style.display = "none";
            videoTime.style.display = "block";
            thumbnailPic.style.height = "inherit";
        });
    }
}

async function displayChannelVideoList(channelName, findChannelVideoList) {
    let channelVideoList;
    if (findChannelVideoList.length > 0) {
        channelVideoList = findChannelVideoList;
    } else {
        channelVideoList = await getChannelVideo(channelName);
    }

    let videoIdList = [];
    channelVideoList.forEach(videoList => videoIdList.push(videoList.video_id));
    
    let videoInfoPromises = videoIdList.map((video) => getVideoData(video));
    let videoInfoList = await Promise.all(videoInfoPromises);

    displayMainVideo(videoInfoList);

    let videoCard = document.querySelector('.video-card');
    let innerInfo = ''

    for (let i = 0; i < videoInfoList.length; i++) {
        let videoInfo = videoInfoList[i];
        let videoURL = `location.href='../html/video.html?id=${i}'`;
        let uploadTime = timeForToday(videoInfo.upload_date);

        innerInfo += `
        <div class="xsamll-video">
            <div class="video-desc">
                <div>
                    <img class="xsamll-video-img" src="${videoInfo.image_link}" onclick="${videoURL}" alt="${videoInfo.video_title}" title="${videoInfo.video_title}">
                    <video class="xsamll-video-video played" src="${videoInfo.video_link}" onclick="${videoURL}" controls style='display:none;'></video>
                    <p class="video-time">0:10</p>
                </div>
                <p title="${videoInfo.video_title}">${videoInfo.video_title}</p>
                <div class="video-desc-views">
                    <p class="channel-name">${videoInfo.video_channel}</p>
                    <p class="channel-views">${formatCount(videoInfo.views) + ' views · ' + uploadTime}</p>
                </div>
            </div>
        </div>
        `
    }
    videoCard.innerHTML = innerInfo;

    const right_button = document.querySelector('.right-arrow');
    if (videoIdList.length < 5) {
        right_button.style.visibility = 'hidden';
    }

    const thumbnailItems = document.querySelectorAll('.video-desc');
    hoverPlay(thumbnailItems);
}

async function displayChannelInfo() {
    const currentUrl = window.location.href;
    let idx = currentUrl.indexOf('?');
    let parseChannelName = '';

    if (idx !== -1) {
        parseChannelName = currentUrl.substring(idx + 4);
    }

    let channelBanner = document.querySelector(".channel-cover img");
    let channelProfile = document.querySelector(".channel-profile .profile-pic .user-avatar");
    let channelName = document.querySelector(".channel-profile-name");
    let channelSubscribers = document.querySelector(".channel-subscribes");

    if (idx !== -1) {
        let data = getChannelInfo(parseChannelName);
        data.then((v) => {
            channelBanner.src = v.channel_banner;
            channelProfile.src = v.channel_profile;
            channelProfile.setAttribute('alt', `${v.channel_name} 프로필`);
            channelProfile.setAttribute('title', `${v.channel_name} 프로필`);
            channelName.innerHTML = v.channel_name;
            channelSubscribers.innerHTML = formatSubscribersCount(v.subscribers);
        });
        displayChannelVideoList(parseChannelName, []);
    }

}

function formatSubscribersCount(subscribers) {
    if (subscribers < 1000) {
        return `${subscribers.toString()} subscribers`;
    } else if (subscribers < 1000000) {
        const thousands = (subscribers / 1000).toFixed(1);
        return `${thousands}K subscribers`;
    } else {
        const millions = (subscribers / 1000000).toFixed(1);
        return `${millions}M subscribers`;
    }
}

// 채널 내에서 검색
async function searchInChannel(channelName, searchText) {
    let videoList = await getChannelVideo(channelName);

    let videoTags = new Set();
    videoList.forEach(video => video.video_tag.forEach(tag => videoTags.add(tag)));

    let findVideoList = videoList.filter((video) => {
        let title = video.video_title.toLowerCase();
        let detail = video.video_detail.toLowerCase();
        let channelName = video.video_channel.toLowerCase();
        let tag = video.video_tag;
        let lowerCaseTag = tag.map(element => {
            return element.toLowerCase();
        });

        if (title.includes(searchText) || detail.includes(searchText)
            || channelName.includes(searchText) || lowerCaseTag.includes(searchText)) {
            return true;
        }
    });

    let smallVideo = document.querySelector('.small-video');
    let contentTag = document.querySelector('.content');
    let result = document.querySelector('.result');

    if (findVideoList.length !== 0) {
        if (smallVideo.style.display === 'none') {
            smallVideo.style.display = 'inline-flex';
        }
        if (contentTag.style.display === 'none') {
            contentTag.style.display = 'flex';
        }
        result.style.display = 'none';
        displayChannelVideoList(parseChannelName, findVideoList);
    } else {
        result.style.display = 'flex';

        let pTag = document.querySelector('.result > p');
        pTag.innerText = `이 채널에 ‘${searchText}’와(과) 일치하는 콘텐츠가 없습니다.`;

        smallVideo.style.display = 'none';
        contentTag.style.display = 'none';

        let old = document.querySelector('.result > p');

        if (old != null) {
            result.removeChild(old);
            result.appendChild(pTag);
        } else {
            result.replaceChild(pTag, old);
        }
    }
}

// 채널내에서 검색
const channelSearchIcon = document.querySelector(".channel-toolbar-search > .leftArrow");
const channelSearchBox = document.querySelector(".channel-toolbar-search > input");
const currentUrl = window.location.href;
let idx = currentUrl.indexOf('?');
let parseChannelName = '';
if (idx !== -1) {
    parseChannelName = currentUrl.substring(idx + 4);
}
channelSearchIcon.addEventListener("click", function () {
    searchInChannel(parseChannelName, channelSearchBox.value);
});
channelSearchBox.addEventListener("keypress", function (event) {
    if (event.keyCode === 13) {
        searchInChannel(parseChannelName, channelSearchBox.value);
    }
});

// 비디오 슬라이드 
let currentPosition = 0;
const left_button_container = document.querySelector('.left-arrow-container');
const videoCardsWidth = document.querySelector('.video-card').offsetWidth;

function slideVideoCards() {
    const videoCards = document.querySelector('.video-card');
    const minPosition = -videoCardsWidth; 
    
    if (currentPosition >= minPosition + 218) {
        currentPosition = currentPosition - 218;
    }

    if (currentPosition <= minPosition) {
        right_button.style.visibility = 'hidden';
    }

    videoCards.style.transform = `translateX(${currentPosition}px)`;

    if (currentPosition != 0) {
        left_button_container.style.visibility = 'visible';
    }
}

function slideVideoCardsLeft() {
    const video_cards = document.querySelector('.video-card');

    if (videoCardsWidth >= 0) {
        currentPosition = currentPosition + 218;
    }

    video_cards.style.transform = `translateX(${currentPosition}px)`;

    if (currentPosition == 0) {
        left_button_container.style.visibility = 'hidden';
    }
    if (currentPosition >= -videoCardsWidth) {
        right_button.style.visibility = 'visible';
    }
}

const right_button = document.querySelector('.right-arrow');
right_button.addEventListener('click', slideVideoCards);

const left_button = document.querySelector('.left-arrow');
left_button.addEventListener('click', slideVideoCardsLeft);