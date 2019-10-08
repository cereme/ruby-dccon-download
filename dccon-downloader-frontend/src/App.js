import React from 'react';
import './App.css';

import ReactGA from 'react-ga';
import LoadingOverlay from 'react-loading-overlay'

export default class App extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
       queryText: '',
       dcconNumber: 52640,
       searchResult: [],
       downloadButtonDisabled: false,
       loading: false,
    }
  }

  _onPressSearch = () =>{
    ReactGA.event({
      'category': 'search',
      'action': 'press',
      'label': this.state.queryText,
    });
    this.setState({loading: true});
    fetch('https://7d2i8oa48i.execute-api.ap-northeast-2.amazonaws.com/prod/search',{
      method: 'POST',
      body: JSON.stringify({query_text: this.state.queryText})
    })
    .then(res => res.json())
    .then(res => {
      this.setState({searchResult: JSON.parse(res.body), loading: false});
    });
  }

  SearchResultList(props) {
    return (
      <div className="SearchResult-container">
        {props.items.map((item, index) => (
          <div key={item.num} className="SearchResult-element" onClick={()=>{props.downloader(item.num)}}>
            <img src={`data:image/jpg;base64,${item.thumbnail}`} alt={item.name}/>
            <span>{item.name}</span>
          </div>
        ))}
      </div>
    );
  }

  _downloadFile = (dccon_num) => {
    this.setState({loading: true});
    fetch('https://7d2i8oa48i.execute-api.ap-northeast-2.amazonaws.com/prod/download',{
      method: 'POST',
      body: JSON.stringify({dccon_num})
    })
    .then(res => res.json())
    .then(res => {
      var element = document.createElement('a');
      element.setAttribute('href', 'data:text/plain;base64,' + res.body);
      element.setAttribute('download', res.filename);
      element.style.display = 'none';
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      this.setState({loading: false});
    });
  }

  _onPressDownload = () => {
    ReactGA.event({
      'category': 'download',
      'action': 'press',
      'label': this.state.dcconNumber,
    });
    this._downloadFile(this.state.dcconNumber);
  }
  
  render(){
    return(
      <div>
        <LoadingOverlay className="App" active={this.state.loading}
          styles={{
            content: (base) => ({
              ...base,
              position: 'fixed',
              top: '40%',
              left: '40%',
              margin: 'auto',
            })
          }}
          spinner text='로딩중... 최대 10초정도 걸립니다'>
          <span>검색결과를 클릭해서 바로 zip파일로 다운로드 가능</span>
          <div className="Search-conatiner">
            <span> 검색어 </span>
            <input id="searchInput" onKeyPress={event => { if (event.key === 'Enter') this._onPressSearch(); }}
            onChange={(e)=>{this.setState({queryText: e.target.value})}}></input>
            <button onClick={this._onPressSearch}> 검색! </button>
          </div>
          <this.SearchResultList items={this.state.searchResult} downloader={this._downloadFile}/>
          <div className="Download-conatiner">
            <span> 디씨콘 번호 </span>
            <input id="downloadInput" onKeyPress={event => { if (event.key === 'Enter') this._onPressDownload(); }}
            onChange={(e)=>{this.setState({dcconNumber: e.target.value})}} placeholder={52640}/>
            <button onClick={this._onPressDownload} disabled={this.state.downloadButtonDisabled}> 
              {this.state.downloadButtonDisabled? '다운로드중...' : '다운로드!'}
            </button>
          </div>
          <span> Github Repository: <a href="https://github.com/cereme/dccon-downloader" target="_blank">https://github.com/cereme/dccon-downloader</a> </span>
        </LoadingOverlay>
      </div>
    )
  }
}